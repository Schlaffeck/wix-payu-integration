export const PayUEnabled = true;
export const PayUEnvironment = 'test'; // or 'prod'

// Test PayU data
// POS ID (pos_id):                    300746
// Second key (MD5):                   b6ca15b0d1020e8094d9b5f8d163db54
// OAuth protocol - client_id:         300746
// OAuth protocol - client_secret:     2ee86a66e5d97e3fadc400c9f19b065d

export const PayUTestPointOfSalesId = "3007461";
export const PayUTestClientId = "300746";
export const PayUTestClientSecret = "2ee86a66e5d97e3fadc400c9f19b065d";

export const PayUAuthUrl = "https://secure.payu.com/pl/standard/user/oauth/authorize";
export const PayUOrdersUrl = "https://secure.payu.com/api/v2_1/orders/";
export const PayUNotifyUrl = "https://www.agnieszkalozinskacom.com/_functions/payuNotify";
export const PayUContinueUrl = "https://www.agnieszkalozinskacom.com/thank-you-page";

export function isTest() {
    return PayUEnvironment === 'test';
}