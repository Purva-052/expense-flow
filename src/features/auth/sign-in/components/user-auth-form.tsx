/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/use-auth-store";
import { Form } from "@/components/ui/form";
import CustomButton from "@/components/shared/custom-button";
import { TextInputField } from "@/components/shared/custom-input-field";
import { formSchema, TFormSchema } from "../schema/login.schema";
import { useLogin } from "../services/sign-in-service";
// import { useLogin } from '../services/sign-in-service'
import FormPasswordField from "./form-password-field";

export const LoginForm = () => {
  const { login } = useAuthStore();
  const { navigate } = useRouter();

  const onSuccess = (data: any) => {
    login(data);
    navigate({ to: "/", replace: true });
  };

  const { mutate: loginMutate, isPending: isSubmitting } = useLogin(onSuccess);

  const form = useForm<TFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: TFormSchema) => loginMutate(data);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TextInputField
          label="Email"
          placeholder="admin@company.com"
          control={form.control}
          className="bg-white text-black"
          name="email"
        />
        <FormPasswordField
          form={form}
          label="Password"
          name="password"
          key={"password"}
        />
        <CustomButton
          type="submit"
          label="Submit"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};
