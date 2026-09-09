export type ContactActionState =
  | {
      status: "idle";
    }
  | {
      status: "error";
      error: string | null;
      fieldErrors: Partial<
        Record<
          | "fullName"
          | "workEmail"
          | "clinicName"
          | "locationCount"
          | "phone"
          | "message",
          string
        >
      >;
    }
  | {
      status: "success";
    };

export const initialContactActionState: ContactActionState = {
  status: "idle",
};
