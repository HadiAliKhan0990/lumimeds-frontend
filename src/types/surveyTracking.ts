export type SurveyTrackingParams = {
  event:
    | 'survey_get_started'
    | 'checkout_completed'
    | 'checkout_success'
    | 'survey_email_submitted'
    | 'survey_submitted'
    | 'product_summary_checkout_initiated';
  payload?: Record<string, string | number>;
};
