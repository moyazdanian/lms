import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { Formik } from "formik";
import {
  phoneSchema,
  nameSchema,
  emailSchema,
  YupObject,
  avatarSchema,
} from "@/utilities/validation/ValidationSchema";
import { Spinner } from "../ui/spinner";
import ImageUploader from "../ui/image-uploader";

export default function Profile({ user, editUserProfile, isPending }) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Profile Information</h3>
      <Formik
        initialValues={{
          name: user?.name,
          email: user?.email,
          phone: user?.phone ?? "",
          avatar: null,
        }}
        validationSchema={YupObject({
          name: nameSchema,
          email: emailSchema,
          phone: phoneSchema,
          avatar: avatarSchema,
        })}
        onSubmit={async (values, { setErrors }) => {
          const formData = new FormData();
          formData.append("name", values.name);
          formData.append("email", values.email);
          if (values.phone) formData.append("phone", values.phone);
          if (values.avatar) formData.append("avatar", values.avatar);
          try {
            editUserProfile(formData);
          } catch (err) {
            if (err.status === 422 && err.data?.errors) {
              setErrors(err.data.errors);
            }
          }
        }}
      >
        {({
          errors,
          handleSubmit,
          getFieldProps,
          setFieldValue,
        }) => (
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <ImageUploader
              value={user?.avatar}
              onChange={(file) => setFieldValue("avatar", file)}
            />

            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...getFieldProps("name")} />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...getFieldProps("email")} />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...getFieldProps("phone")} />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <Button type="submit">{isPending ? <Spinner /> : "Save"}</Button>
          </form>
        )}
      </Formik>
    </div>
  );
}
