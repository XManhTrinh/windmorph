'use client';

import { Button, IconButton, TextField } from '@windmorph/react';
import { useState, type SVGProps } from 'react';

const VisibilityIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Z" />
  </svg>
);

const VisibilityOffIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true" {...props}>
    <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Z" />
  </svg>
);

/**
 * Text fields in a form, their most common home: a visible label on each, validation that
 * waits until a field is left (and then follows each keystroke), a password with a trailing
 * icon button to show it, and a hint that appears only while its field has focus.
 */
export function TextFieldForm() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailInvalid = touched && !/^\S+@\S+\.\S+$/.test(email);

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setTouched(true);
      }}
    >
      <TextField label="Full name" autoComplete="name" required className="w-full" />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={setEmail}
        onBlur={() => setTouched(true)}
        invalid={emailInvalid}
        errorMessage="Enter an email address like sam@example.com."
        className="w-full"
      />
      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        required
        supportingText="At least 12 characters."
        supportingTextOnFocus
        trailingIcon={
          <IconButton
            variant="standard"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            icon={showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            onPress={() => setShowPassword((shown) => !shown)}
          />
        }
        className="w-full"
      />
      <Button type="submit" className="self-end">
        Create account
      </Button>
    </form>
  );
}
