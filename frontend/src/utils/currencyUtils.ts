export interface CurrencyInfo {
    code: string;
    symbol: string;
    name: string;
    quickAmounts: string[];
    minAmount: number;
}
const TIMEZONE_CURRENCY_MAP: Record<string, string> = {
    'Asia/Kolkata': 'INR',
    'Asia/Calcutta': 'INR',
    'Asia/Colombo': 'LKR',
    'Asia/Karachi': 'PKR',
    'Asia/Dhaka': 'BDT',
    'Asia/Kathmandu': 'NPR',
    'Asia/Tokyo': 'JPY',
    'Asia/Singapore': 'SGD',
    'Asia/Hong_Kong': 'HKD',
    'Asia/Shanghai': 'CNY',
    'Asia/Seoul': 'KRW',
    'Asia/Bangkok': 'THB',
    'Asia/Dubai': 'AED',
    'Asia/Riyadh': 'SAR',
    'Asia/Muscat': 'OMR',
    'Asia/Kuwait': 'KWD',
    'Asia/Baghdad': 'IQD',
    'Asia/Kabul': 'AFN',
    'Asia/Tehran': 'IRR',
    'Asia/Jakarta': 'IDR',
    'Asia/Manila': 'PHP',
    'Asia/Kuala_Lumpur': 'MYR',
    'Asia/Taipei': 'TWD',
    'Pacific/Auckland': 'NZD',
    'Australia/Sydney': 'AUD',
    'Australia/Melbourne': 'AUD',
    'Australia/Brisbane': 'AUD',
    'Australia/Perth': 'AUD',
    'Europe/London': 'GBP',
    'Europe/Paris': 'EUR',
    'Europe/Berlin': 'EUR',
    'Europe/Madrid': 'EUR',
    'Europe/Rome': 'EUR',
    'Europe/Amsterdam': 'EUR',
    'Europe/Brussels': 'EUR',
    'Europe/Vienna': 'EUR',
    'Europe/Zurich': 'CHF',
    'Europe/Stockholm': 'SEK',
    'Europe/Oslo': 'NOK',
    'Europe/Copenhagen': 'DKK',
    'Europe/Warsaw': 'PLN',
    'Europe/Moscow': 'RUB',
    'America/Toronto': 'CAD',
    'America/Vancouver': 'CAD',
    'America/Montreal': 'CAD',
    'America/Sao_Paulo': 'BRL',
    'America/Mexico_City': 'MXN',
    'America/Buenos_Aires': 'ARS',
    'America/Bogota': 'COP',
    'America/Lima': 'PEN',
    'America/Santiago': 'CLP',
    'Africa/Lagos': 'NGN',
    'Africa/Nairobi': 'KES',
    'Africa/Cairo': 'EGP',
    'Africa/Johannesburg': 'ZAR',
};

const CURRENCY_INFO: Record<string, CurrencyInfo> = {
    INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', quickAmounts: ['100', '500', '1000', '2500'], minAmount: 50 },
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', quickAmounts: ['2', '5', '10', '25'], minAmount: 1 },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', quickAmounts: ['2', '5', '10', '25'], minAmount: 1 },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound', quickAmounts: ['2', '5', '10', '25'], minAmount: 1 },
    AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', quickAmounts: ['3', '5', '10', '25'], minAmount: 1 },
    CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', quickAmounts: ['3', '5', '10', '25'], minAmount: 1 },
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', quickAmounts: ['200', '500', '1000', '2500'], minAmount: 50 },
    SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', quickAmounts: ['3', '5', '10', '25'], minAmount: 1 },
    AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', quickAmounts: ['5', '10', '20', '50'], minAmount: 2 },
    SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', quickAmounts: ['5', '10', '20', '50'], minAmount: 2 },
    CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', quickAmounts: ['10', '20', '50', '100'], minAmount: 5 },
    KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', quickAmounts: ['2000', '5000', '10000', '25000'], minAmount: 600 },
    BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', quickAmounts: ['5', '10', '25', '50'], minAmount: 3 },
    MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', quickAmounts: ['25', '50', '100', '250'], minAmount: 10 },
    ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', quickAmounts: ['20', '50', '100', '250'], minAmount: 10 },
    CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', quickAmounts: ['2', '5', '10', '25'], minAmount: 1 },
    HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', quickAmounts: ['10', '25', '50', '100'], minAmount: 5 },
    NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', quickAmounts: ['3', '5', '10', '25'], minAmount: 1 },
    SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', quickAmounts: ['20', '50', '100', '250'], minAmount: 5 },
    NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', quickAmounts: ['20', '50', '100', '250'], minAmount: 5 },
    NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', quickAmounts: ['500', '1000', '2500', '5000'], minAmount: 200 },
    KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', quickAmounts: ['200', '500', '1000', '2500'], minAmount: 50 },
    IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', quickAmounts: ['20000', '50000', '100000', '250000'], minAmount: 10000 },
    PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', quickAmounts: ['100', '250', '500', '1000'], minAmount: 30 },
    MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', quickAmounts: ['5', '10', '25', '50'], minAmount: 3 },
    THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', quickAmounts: ['50', '100', '250', '500'], minAmount: 20 },
    PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', quickAmounts: ['250', '500', '1000', '2500'], minAmount: 150 },
    BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', quickAmounts: ['100', '250', '500', '1000'], minAmount: 60 },
    EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', quickAmounts: ['50', '100', '250', '500'], minAmount: 15 },
};

/**
 * Detect the user's currency from browser locale and timezone.
 * Falls back to INR if detection fails.
 */
export function detectCurrency(): CurrencyInfo {
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone && TIMEZONE_CURRENCY_MAP[timezone]) {
            const code = TIMEZONE_CURRENCY_MAP[timezone];
            if (CURRENCY_INFO[code]) return CURRENCY_INFO[code];
        }
        const locale = navigator.language || 'en-IN';
        const formatted = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' })
            .formatToParts(1)
            .find(p => p.type === 'currency')?.value;
        for (const lang of navigator.languages || [locale]) {
            const region = lang.split('-')[1]?.toUpperCase();
            if (region) {
                const match = Object.values(CURRENCY_INFO).find(c =>
                    c.code.startsWith(region) || region === 'IN' && c.code === 'INR'
                );
                if (match) return match;
            }
        }
    } catch (_) {
    }
    return CURRENCY_INFO['INR'];
}

/**
 * Get currency info by code. Falls back to INR if not found.
 */
export function getCurrencyInfo(code: string): CurrencyInfo {
    return CURRENCY_INFO[code.toUpperCase()] || CURRENCY_INFO['INR'];
}

/**
 * Format an amount with the currency symbol (no library needed).
 */
export function formatAmount(amount: number, currency: CurrencyInfo): string {
    return `${currency.symbol}${amount.toFixed(2)}`;
}

export const ALL_CURRENCIES = Object.values(CURRENCY_INFO);
