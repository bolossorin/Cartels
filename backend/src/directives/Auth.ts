import {
  SchemaDirectiveVisitor,
  AuthenticationError,
} from "apollo-server-express";

export default class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type._requires = this.args.requires || "LOGGEDIN";
    type._allowPlayerless = this.args.allowPlayerless;
  }

  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    field._requires = this.args.requires || "LOGGEDIN";
    field._allowPlayerless = this.args.allowPlayerless;
  }

  ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType.alreadyWrapped) return;
    objectType.alreadyWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      if (fieldName !== "_empty") {
        const { resolve = null } = field;
        field.resolve = async function (...args) {
          // Get the required Role from the field first, falling back
          // to the objectType if no Role is required by the field:
          const loginState = field._requires || objectType._requires;
          const allowPlayerless =
            field._allowPlayerless || objectType._allowPlayerless;

          if (!loginState) {
            return resolve.apply(this, args);
          }
          const authRequired = loginState === "LOGGEDIN";

          const context = args[2];
          const contextHasAccount = context.account !== null;
          const contextHasPlayer = context.player !== null;

          if (
            authRequired !== contextHasAccount ||
            (authRequired && !allowPlayerless && !contextHasPlayer)
          ) {
            let authError = `You must be logged ${
              authRequired ? "in" : "out"
            } to access this feature.`;
            if (authRequired && !allowPlayerless) {
              authError = "You must have a player account to proceed.";
            }

            throw new AuthenticationError(authError);
          }

          return resolve.apply(this, args);
        };
      }
    });
  }
}
