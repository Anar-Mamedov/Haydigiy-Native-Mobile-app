/** Query keys for the customer feedback form. The viewer (member contact info) differs per session. */
export const customerFeedbackKeys = {
  all: ['customer-feedback'] as const,
  form: (viewerKey: string) => [...customerFeedbackKeys.all, 'form', 'general', viewerKey] as const,
};
