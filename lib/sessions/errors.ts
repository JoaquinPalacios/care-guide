import "server-only";

/**
 * Base class for expected, user-actionable failures thrown by the session
 * initialization service. The server action layer maps these to user-visible
 * messages without leaking implementation details. Anything the service does
 * not recognize should bubble up as a 500-class error.
 */
export abstract class SessionCreationError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidRoomError extends SessionCreationError {
  readonly code = "INVALID_ROOM";

  constructor() {
    super("Selected room is not available for this clinic.");
  }
}

export class InvalidDoctorError extends SessionCreationError {
  readonly code = "INVALID_DOCTOR";

  constructor() {
    super("Selected doctor is not available for this clinic.");
  }
}

export class InvalidTemplateError extends SessionCreationError {
  readonly code = "INVALID_TEMPLATE";

  constructor() {
    super("Selected procedure template is not available for this clinic.");
  }
}

export class InvalidSelectedAreaOptionError extends SessionCreationError {
  readonly code = "INVALID_SELECTED_AREA_OPTION";

  constructor() {
    super(
      "Selected area option is not valid for the chosen procedure template."
    );
  }
}

export class MissingSelectedAreaOptionError extends SessionCreationError {
  readonly code = "MISSING_SELECTED_AREA_OPTION";

  constructor() {
    super(
      "This procedure template requires a selected area option before it can start."
    );
  }
}

export class UnexpectedSelectedAreaOptionError extends SessionCreationError {
  readonly code = "UNEXPECTED_SELECTED_AREA_OPTION";

  constructor() {
    super(
      "This procedure template does not accept a selected area option. Leave it empty."
    );
  }
}

export class TemplateHasNoStagesError extends SessionCreationError {
  readonly code = "TEMPLATE_HAS_NO_STAGES";

  constructor() {
    super(
      "Selected procedure template has no stages configured and cannot start a session."
    );
  }
}

export class RoomOccupiedError extends SessionCreationError {
  readonly code = "ROOM_OCCUPIED";

  constructor() {
    super(
      "That room already has an in-progress session. Complete or cancel it before starting a new one."
    );
  }
}
