export const PayUEnabled = true;
export const PayUEnvironment = 'test'; // or 'prod'

export function isTest() {
    return PayUEnvironment === 'test';
}