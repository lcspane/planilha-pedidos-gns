import { Suspense } from 'react';
import LoginForm from './loginform.jsx';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}