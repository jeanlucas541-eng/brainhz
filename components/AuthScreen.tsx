import React, { useState } from 'react';
import { Fingerprint, ArrowRight, Brain, Lock, LockOpen, Loader2, UserPlus, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';

interface Props {
   onSuccess: () => void;
   onBack: () => void;
   onAdminLogin?: () => void;
}

const AuthScreen: React.FC<Props> = ({ onSuccess, onBack, onAdminLogin }) => {
   const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading: authLoading } = useAuth();
   const [loading, setLoading] = useState(false);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [isSignUp, setIsSignUp] = useState(false);
   const [error, setError] = useState('');
   const [successMessage, setSuccessMessage] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccessMessage('');
      setLoading(true);

      try {
         if (isSignUp) {
            // Sign Up Flow
            if (password !== confirmPassword) {
               setError('As senhas não coincidem');
               setLoading(false);
               return;
            }
            if (password.length < 6) {
               setError('A senha deve ter pelo menos 6 caracteres');
               setLoading(false);
               return;
            }
            const result = await signUpWithEmail(email, password);
            if (result.error) {
               setError(result.error);
            } else {
               setSuccessMessage('Conta criada! Verifique seu email para confirmar.');
               setIsSignUp(false);
               setPassword('');
               setConfirmPassword('');
            }
         } else {
            // Login Flow
            const result = await signInWithEmail(email, password);
            if (result.error) {
               setError(result.error);
            } else {
               if (email.toLowerCase() === 'jeanlucas541@gmail.com' && onAdminLogin) {
                  onAdminLogin();
               } else {
                  onSuccess();
               }
            }
         }
      } catch (err: any) {
         setError(err.message || 'Erro ao processar solicitação');
      } finally {
         setLoading(false);
      }
   };

   const handleGoogleLogin = async () => {
      try {
         setLoading(true);
         setError('');
         await signInWithGoogle();
      } catch (e: any) {
         setError(e.message || 'Erro ao entrar com Google');
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-neuro-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
         {/* Background Grid */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
         <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)' }}></div>

         <button onClick={onBack} className="absolute top-8 left-8 text-xs font-mono text-gray-500 hover:text-white transition-colors z-20">
            &larr; VOLTAR AO INÍCIO
         </button>

         <div className="w-full max-w-md bg-neuro-800/50 backdrop-blur-xl border border-neuro-700 rounded-2xl p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">

            <div className="flex flex-col items-center mb-8">
               <img src="/LOGO.jpeg" alt="BrainHz" className="h-24 w-auto object-contain rounded-xl mb-4 shadow-[0_0_20px_rgba(139,92,246,0.3)]" />
               <h2 className="text-2xl font-bold tracking-tight">
                  {isSignUp ? 'Criar Conta Grátis' : 'Identificação Neural'}
               </h2>
               <p className="text-gray-400 text-sm mt-1">
                  {isSignUp ? 'Comece sua jornada de evolução cognitiva.' : 'Acesse sua matriz de frequências pessoal.'}
               </p>
            </div>

            {/* Error Message */}
            {error && (
               <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
                  {error}
               </div>
            )}

            {/* Success Message */}
            {successMessage && (
               <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm text-center">
                  {successMessage}
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase mb-1.5 ml-1">Email</label>
                  <div className="relative">
                     <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        required
                        className="w-full bg-neuro-900 border border-neuro-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neuro-accent focus:ring-1 focus:ring-neuro-accent transition-all"
                     />
                     <Mail className="absolute right-3 top-3.5 text-gray-600 w-4 h-4" />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase mb-1.5 ml-1">
                     {isSignUp ? 'Criar Senha' : 'Senha'}
                  </label>
                  <div className="relative">
                     <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full bg-neuro-900 border border-neuro-700 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-neuro-accent focus:ring-1 focus:ring-neuro-accent transition-all"
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-gray-600 hover:text-neuro-accent transition-colors"
                     >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                  </div>
               </div>

               {/* Confirm Password - Only for Sign Up */}
               {isSignUp && (
                  <div>
                     <label className="block text-xs font-mono text-gray-500 uppercase mb-1.5 ml-1">Confirmar Senha</label>
                     <div className="relative">
                        <input
                           type={showConfirmPassword ? "text" : "password"}
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           placeholder="••••••••"
                           required
                           minLength={6}
                           className="w-full bg-neuro-900 border border-neuro-700 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-neuro-accent focus:ring-1 focus:ring-neuro-accent transition-all"
                        />
                        <button
                           type="button"
                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                           className="absolute right-3 top-3.5 text-gray-600 hover:text-neuro-accent transition-colors"
                        >
                           {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                     </div>
                  </div>
               )}

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neuro-accent hover:bg-neuro-accent/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-neuro-accent/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                     <>
                        {isSignUp ? <UserPlus size={20} /> : <Fingerprint size={20} />}
                        {isSignUp ? 'CRIAR CONTA' : 'AUTENTICAR'}
                     </>
                  )}
               </button>

               {/* Google Login Option */}
               <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full mt-3 bg-white text-gray-900 font-bold py-3.5 rounded-xl transition-all hover:bg-gray-100 flex items-center justify-center gap-2 disabled:opacity-70"
               >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                     <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                     <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                     <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                     <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {isSignUp ? 'Cadastrar com Google' : 'Entrar com Google'}
               </button>
            </form>

            <div className="mt-6 pt-6 border-t border-neuro-700 text-center">
               <p className="text-xs text-gray-500">
                  {isSignUp ? (
                     <>Já possui uma conta? <button onClick={() => { setIsSignUp(false); setError(''); }} className="text-neuro-accent hover:underline font-bold">Fazer Login</button></>
                  ) : (
                     <>Ainda não possui conta? <button onClick={() => { setIsSignUp(true); setError(''); }} className="text-neuro-accent hover:underline font-bold">Criar Conta Grátis</button></>
                  )}
               </p>
            </div>

            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-neuro-500 rounded-tl-lg opacity-50"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-neuro-500 rounded-tr-lg opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-neuro-500 rounded-bl-lg opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-neuro-500 rounded-br-lg opacity-50"></div>
         </div>

         <div className="absolute bottom-8 text-[10px] font-mono text-gray-600">
            SECURE CONNECTION :: ENCRYPTED VIA TLS 1.3
         </div>
      </div>
   );
};

export default AuthScreen;
