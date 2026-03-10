<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS sp_record_payment');

        DB::unprepared(<<<'SQL'
CREATE PROCEDURE sp_record_payment(
    IN p_invoice_id BIGINT,
    IN p_payment_method VARCHAR(30),
    IN p_paid_at VARCHAR(40),
    IN p_actor_type VARCHAR(20),
    IN p_actor_id BIGINT
)
BEGIN
    DECLARE v_member_id BIGINT;
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_status VARCHAR(20);
    DECLARE v_payment_id BIGINT;
    DECLARE v_paid_at DATETIME;
    DECLARE v_paid_at_clean VARCHAR(40);

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

    SET v_paid_at_clean = TRIM(COALESCE(p_paid_at, ''));

    IF v_paid_at_clean = '' THEN
        SET v_paid_at = NOW();
    ELSE
        -- Accept common ISO-8601 forms like: 2026-03-10T11:41:00.000Z
        SET v_paid_at_clean = REPLACE(REPLACE(v_paid_at_clean, 'T', ' '), 'Z', '');
        SET v_paid_at_clean = SUBSTRING_INDEX(v_paid_at_clean, '.', 1);
        SET v_paid_at_clean = SUBSTRING_INDEX(v_paid_at_clean, '+', 1);
        SET v_paid_at = STR_TO_DATE(v_paid_at_clean, '%Y-%m-%d %H:%i:%s');

        IF v_paid_at IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid paid_at datetime value.';
        END IF;
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
        v_paid_at,
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
            'payment_method', LOWER(p_payment_method),
            'paid_at', DATE_FORMAT(v_paid_at, '%Y-%m-%d %H:%i:%s')
        )
    );

    SELECT v_payment_id AS payment_id;
END
SQL);
    }

    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS sp_record_payment');
    }
};

