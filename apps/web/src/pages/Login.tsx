import { useState } from 'react';
import { useMutation, gql } from 'urql';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ModeToggle } from '@/components/mode-toggle';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      user {
        id
        username
        role
        team
      }
    }
  }
`;

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [result, login] = useMutation(LOGIN_MUTATION);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await login({ username, password });

        if (res.error) {
            console.error(res.error);
            setError(res.error.message);
        } else {
            // successful login
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 relative">
            <div className="absolute top-4 right-4 flex gap-2">
                <LanguageToggle />
                <ModeToggle />
            </div>
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        {/* Internal Task Force Logo Placeholder */}
                        <div className="h-12 w-12 rounded bg-black flex items-center justify-center text-white font-bold text-xl">
                            MH
                        </div>
                    </div>
                    <CardTitle>{t('login.title')}</CardTitle>
                    <CardDescription>{t('app.title')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">{t('login.username')}</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder={t('login.username')}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">{t('login.password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button className="w-full" type="submit" disabled={result.fetching}>
                            {result.fetching ? t('login.loading') : t('login.signin')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-xs text-muted-foreground">
                    &copy; 2025 Ioannis Psychias.
                </CardFooter>
            </Card>
        </div>
    );
}
