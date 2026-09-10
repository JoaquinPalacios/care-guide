import type { ContactEnquiryField } from "@/lib/marketing/contact-fields";

export type ContactActionState =
  | {
      status: "idle";
    }
  | {
      status: "error";
      error: string | null;
      fieldErrors: Partial<Record<ContactEnquiryField, string>>;
    }
  | {
      status: "success";
    };

export const initialContactActionState: ContactActionState = {
  status: "idle",
};
