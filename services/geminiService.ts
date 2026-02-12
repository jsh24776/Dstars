
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

const DEFAULT_ERROR =
  "I'm sorry, the AI concierge is temporarily unavailable. Please try again in a moment.";

export const getFitnessRecommendation = async (userInput: string): Promise<string> => {
  const goal = userInput.trim();

  if (!goal) {
    return 'Please describe your fitness goal so I can help.';
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/ai-concierge`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goal }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 429) {
        return 'Too many concierge requests. Please wait a moment and try again.';
      }

      return payload?.message || DEFAULT_ERROR;
    }

    return payload?.data?.recommendation || DEFAULT_ERROR;
  } catch (_error) {
    return DEFAULT_ERROR;
  }
};
