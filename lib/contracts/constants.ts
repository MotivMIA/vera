/** Visual Era contract signing — manager identity and document types. */
export const MANAGER_NAME = "Nathan Williams";
export const MANAGER_ALIAS = "Nathan Williams d/b/a Visual Era";

export type ContractDocumentType = "client_agreement" | "content_release";
export type ContractDocumentState = "not_started" | "sent" | "signed" | "voided";

export const CONTRACT_DOCUMENT_TYPES: ContractDocumentType[] = ["client_agreement", "content_release"];
