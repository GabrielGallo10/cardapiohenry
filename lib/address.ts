import type { SavedAddress } from "./types";

export function formatSavedAddress(a: SavedAddress): string {
  const line1 = [a.street.trim(), a.number.trim()].filter(Boolean).join(", ");
  const loc = [a.neighborhood.trim(), a.city.trim(), a.state.trim().toUpperCase()]
    .filter(Boolean)
    .join(" — ");
  const cep = a.zip.replace(/\D/g, "");
  const cepFmt =
    cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : a.zip.trim();
  const mid = [a.complement?.trim(), loc].filter(Boolean).join(" · ");
  const parts = [line1, mid, cepFmt ? `CEP ${cepFmt}` : ""].filter(Boolean);
  const body = parts.join(" · ");
  const label = a.label?.trim();
  return label ? `${label}: ${body}` : body;
}

export const emptyAddressForm = {
  label: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zip: "",
};

export type AddressFormState = typeof emptyAddressForm;

export function addressFormToSaved(
  id: string,
  f: AddressFormState,
): SavedAddress {
  return {
    id,
    label: f.label.trim() || undefined,
    street: f.street.trim(),
    number: f.number.trim(),
    complement: f.complement.trim() || undefined,
    neighborhood: f.neighborhood.trim(),
    city: f.city.trim(),
    state: f.state.trim(),
    zip: f.zip.trim(),
  };
}

export function isAddressFormComplete(f: AddressFormState): boolean {
  return (
    f.street.trim().length > 0 &&
    f.number.trim().length > 0 &&
    f.neighborhood.trim().length > 0 &&
    f.city.trim().length > 0 &&
    f.state.trim().length >= 2 &&
    f.zip.replace(/\D/g, "").length >= 8
  );
}
