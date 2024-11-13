import { useState } from "react";

/**
 * Hooks that returns loading state when awaiting the function to finish execution. Example use case: LoginView component
 * @param fn async function that is called that that button will wait for completion for. Wrap fn to call with required paramas in lambda to pass as paramter to this hook.
 */
export const useButtonWithLoading = (
  fn: () => Promise<void>
): [boolean, () => Promise<void>] => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fnWithLoading = async () => {
    setIsSubmitting(true);

    try {
      await fn();
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return [isSubmitting, fnWithLoading];
};
