import { useState, ChangeEvent, FormEvent } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    
    setValues((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    if (errors[name as keyof T]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const setFieldValue = (name: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    setFieldValue,
    handleSubmit,
    resetForm,
  };
}
