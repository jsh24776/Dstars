<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
DROP PROCEDURE IF EXISTS sp_log_activity;
SQL);

        DB::unprepared(<<<'SQL'
CREATE PROCEDURE sp_log_activity(
    IN p_actor_type VARCHAR(20),
    IN p_actor_id BIGINT,
    IN p_action VARCHAR(60),
    IN p_entity_type VARCHAR(60),
    IN p_entity_id BIGINT,
    IN p_details LONGTEXT
)
BEGIN
    INSERT INTO activity_logs (
        actor_type,
        actor_id,
        action,
        entity_type,
        entity_id,
        details,
        created_at,
        updated_at
    ) VALUES (
        p_actor_type,
        p_actor_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_details,
        NOW(),
        NOW()
    );
END
SQL);

        DB::unprepared(<<<'SQL'
DROP PROCEDURE IF EXISTS sp_record_payment;
SQL);

        DB::unprepared(<<<'SQL'
CREATE PROCEDURE sp_record_payment(
    IN p_invoice_id BIGINT,
    IN p_payment_method VARCHAR(30),
    IN p_paid_at DATETIME,
    IN p_actor_type VARCHAR(20),
    IN p_actor_id BIGINT
)
BEGIN
    DECLARE v_member_id BIGINT;
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_status VARCHAR(20);
    DECLARE v_payment_id BIGINT;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_member_id = NULL;

    SELECT member_id, total_amount, status
    INTO v_member_id, v_total_amount, v_status
    FROM invoices
    WHERE id = p_invoice_id
    FOR UPDATE;

    IF v_member_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invoice not found.';
    END IF;

    IF v_status = 'paid' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invoice is already marked as paid.';
    END IF;

    IF v_status = 'cancelled' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cancelled invoices cannot be paid.';
    END IF;

    IF EXISTS (SELECT 1 FROM payments WHERE invoice_id = p_invoice_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Payment already recorded for this invoice.';
    END IF;

    INSERT INTO payments (
        payment_reference,
        invoice_id,
        member_id,
        amount_paid,
        payment_method,
        payment_status,
        paid_at,
        created_at,
        updated_at
    ) VALUES (
        NULL,
        p_invoice_id,
        v_member_id,
        v_total_amount,
        LOWER(p_payment_method),
        'confirmed',
        COALESCE(p_paid_at, NOW()),
        NOW(),
        NOW()
    );

    SET v_payment_id = LAST_INSERT_ID();

    UPDATE payments
    SET payment_reference = CONCAT('DSTARS-PAY-', LPAD(CAST(v_payment_id AS CHAR), 6, '0')),
        updated_at = NOW()
    WHERE id = v_payment_id;

    UPDATE invoices
    SET status = 'paid',
        payment_method = LOWER(p_payment_method),
        updated_at = NOW()
    WHERE id = p_invoice_id;

    CALL sp_log_activity(
        p_actor_type,
        p_actor_id,
        'payment_recorded',
        'payment',
        v_payment_id,
        JSON_OBJECT(
            'invoice_id', p_invoice_id,
            'member_id', v_member_id,
            'amount_paid', v_total_amount,
            'payment_method', LOWER(p_payment_method)
        )
    );

    SELECT v_payment_id AS payment_id;
END
SQL);

        DB::unprepared(<<<'SQL'
DROP TRIGGER IF EXISTS trg_invoice_items_before_insert;
SQL);

        DB::unprepared(<<<'SQL'
CREATE TRIGGER trg_invoice_items_before_insert
BEFORE INSERT ON invoice_items
FOR EACH ROW
BEGIN
    SET NEW.line_total = ROUND(NEW.quantity * NEW.unit_price, 2);
END
SQL);

        DB::unprepared(<<<'SQL'
DROP TRIGGER IF EXISTS trg_invoice_items_before_update;
SQL);

        DB::unprepared(<<<'SQL'
CREATE TRIGGER trg_invoice_items_before_update
BEFORE UPDATE ON invoice_items
FOR EACH ROW
BEGIN
    SET NEW.line_total = ROUND(NEW.quantity * NEW.unit_price, 2);
END
SQL);

        DB::unprepared(<<<'SQL'
DROP TRIGGER IF EXISTS trg_payments_before_insert;
SQL);

        DB::unprepared(<<<'SQL'
CREATE TRIGGER trg_payments_before_insert
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
    DECLARE v_invoice_total DECIMAL(10,2);
    DECLARE v_invoice_status VARCHAR(20);

    SET v_invoice_total = (SELECT total_amount FROM invoices WHERE id = NEW.invoice_id);
    SET v_invoice_status = (SELECT status FROM invoices WHERE id = NEW.invoice_id);

    IF v_invoice_total IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invoice not found for payment.';
    END IF;

    IF v_invoice_status <> 'pending' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only pending invoices can be paid.';
    END IF;

    IF ROUND(NEW.amount_paid, 2) <> ROUND(v_invoice_total, 2) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Payment amount must match invoice total.';
    END IF;

    IF NEW.amount_paid < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Payment amount cannot be negative.';
    END IF;
END
SQL);
    }

    public function down(): void
    {
        DB::unprepared("DROP TRIGGER IF EXISTS trg_payments_before_insert");
        DB::unprepared("DROP TRIGGER IF EXISTS trg_invoice_items_before_update");
        DB::unprepared("DROP TRIGGER IF EXISTS trg_invoice_items_before_insert");
        DB::unprepared("DROP PROCEDURE IF EXISTS sp_record_payment");
        DB::unprepared("DROP PROCEDURE IF EXISTS sp_log_activity");
    }
};
