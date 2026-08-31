export interface CreateSessionActionState {
  error: string | null;
  fieldErrors: Partial<Record<string, string>>;
}

export const initialCreateSessionActionState: CreateSessionActionState = {
  error: null,
  fieldErrors: {},
};
