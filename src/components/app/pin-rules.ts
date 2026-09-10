/**
 * What a transaction PIN is, in one place.
 *
 * Four digits, entered in the four-box grid the wallet PIN already uses. The
 * backend still accepts four to ten — this app simply never creates or asks
 * for anything but four, so the two PINs a person deals with behave
 * identically wherever either is requested.
 */
export const PIN_CREATE_LENGTH = 4;

/** A complete PIN: exactly `PIN_CREATE_LENGTH` digits. */
export const isValidNewPin = (pin: string) => pin.length === PIN_CREATE_LENGTH;
