import * as Yup from "yup";
export const YupObject = (schemaObject) => Yup.object().shape(schemaObject);
export const emailSchema = Yup.string()
  .email("enter a correct email")
  .required("email field is required");
export const passwordSchema = Yup.string()
  .min(8, "password should be at least 8 characters")
  .required("password field is required");
export const passwordConfirmSchema = Yup.string()
  .required("password confirm field is required")
  .oneOf([Yup.ref("password")], "passwords must match");
export const nameSchema = Yup.string().required("name field is required");
export const phoneSchema = Yup.string()
  .matches(/^[0-9]{10,15}$/, "enter a valid phone number")
  .nullable();
export const avatarSchema = Yup.mixed().nullable();
export const textSchema = Yup.string().required("Review field is required!");
