import React from 'react'

const TextInput = ({
  id,
  name,
  type = 'text',
  autoComplete,
  required = false,
  value,
  onChange,
  placeholder,
  className = '',
  ...props
}) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      autoComplete={autoComplete}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 ${className}`}
      {...props}
    />
  )
}

export default TextInput
