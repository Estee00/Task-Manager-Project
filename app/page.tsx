'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

export default function AuthPage() {
	const router = useRouter();
	const [mode, setMode] = useState<'login' | 'register'>('login');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [form, setForm] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
	});

	useEffect(() => {
		const user = localStorage.getItem('auth_user');
		if (user) router.push('/dashboard');
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const getUsers = () => {
		const users = localStorage.getItem('users');
		return users ? JSON.parse(users) : [];
	};

	const saveUsers = (users: any[]) => {
		localStorage.setItem('users', JSON.stringify(users));
	};

	const handleRegister = () => {
		setIsSubmitting(true);
		const { firstName, lastName, email, password } = form;
		if (!firstName || !lastName || !email || !password) {
			alert('Please fill all fields');
			return setIsSubmitting(false);
		}

		const users = getUsers();
		if (users.find(u => u.email === email)) {
			alert('Email already exists');
			return setIsSubmitting(false);
		}

		const newUser = {
			id: Date.now().toString(),
			firstName,
			lastName,
			email,
			password,
		};

		saveUsers([...users, newUser]);
		localStorage.setItem('auth_user', JSON.stringify(newUser));
		router.push('/dashboard');
	};

	const handleLogin = () => {
		setIsSubmitting(true);
		const users = getUsers();
		const user = users.find(
			u => u.email === form.email && u.password === form.password
		);
		if (user) {
			localStorage.setItem('auth_user', JSON.stringify(user));
			router.push('/dashboard');
		} else {
			alert('Invalid credentials');
			setIsSubmitting(false);
		}
	};

	const handleSubmit = () => {
		if (isSubmitting) return;
		if (mode === 'login') handleLogin();
		else handleRegister();
	};

	return (
		<Container>
			<Box>
				<Title>{mode === 'login' ? 'Login' : 'Register'}</Title>

				{mode === 'register' && (
					<>
						<Input
							name="firstName"
							placeholder="First Name"
							value={form.firstName}
							onChange={handleChange}
						/>
						<Input
							name="lastName"
							placeholder="Last Name"
							value={form.lastName}
							onChange={handleChange}
						/>
					</>
				)}

				<Input
					name="email"
					placeholder="Email"
					value={form.email}
					onChange={handleChange}
				/>
				<Input
					name="password"
					type="password"
					placeholder="Password"
					value={form.password}
					onChange={handleChange}
				/>

				<Button onClick={handleSubmit} disabled={isSubmitting}>
					{isSubmitting
						? mode === 'login'
							? 'Logging in...'
							: 'Registering...'
						: mode === 'login'
							? 'Login'
							: 'Register'}
				</Button>

				<Switch>
					{mode === 'login'
						? "Don't have an account?"
						: 'Already have an account?'}{' '}
					<LinkText onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
						{mode === 'login' ? 'Register' : 'Login'}
					</LinkText>
				</Switch>
			</Box>
		</Container>
	);
}

// Styled Components

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #ece9e6, #ffffff);
  font-family: Arial, sans-serif;
`;

const Box = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  max-width: max-content;
`;

const Title = styled.h1`
  font-size: 24px;
  text-align: center;
  margin-bottom: 25px;
`;

const Input = styled.input`
  width: 420px;
  padding: 12px 14px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
`;

const Button = styled.button<{ disabled?: boolean }>`
  width: 420px;
  padding: 12px 14px;
  background-color: ${({ disabled }) => (disabled ? '#a3a3a3' : '#4f46e5')};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? '#a3a3a3' : '#4338ca')};
  }
`;

const Switch = styled.p`
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: #555;
`;

const LinkText = styled.span`
  color: #4f46e5;
  cursor: pointer;
  font-weight: bold;
  margin-left: 6px;
`;

