import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mic, BrainCircuit, LayoutList, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/auth-context";

type Mode = "login" | "register";

export default function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, register, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [grade, setGrade] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!username.trim() || !password.trim()) {
      setFormError(t("auth.usernameRequired"));
      return;
    }

    if (mode === "register") {
      if (!email.trim()) {
        setFormError(t("auth.emailRequired"));
        return;
      }
      if (password.length < 6) {
        setFormError(t("errors.invalidInput"));
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(username.trim(), password);
        toast.success(t("auth.loginSuccess"));
      } else {
        await register(username.trim(), email.trim(), password, displayName.trim() || undefined, grade.trim() || undefined);
        toast.success(t("auth.registerSuccess"));
      }
      navigate("/", { replace: true });
    } catch (err: any) {
      setFormError(err.message || (mode === "login" ? t("auth.invalidCredentials") : t("errors.serverError")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 flex flex-col">
      <div className="container mx-auto max-w-md px-4 flex-1 flex flex-col justify-center py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t("home.title")}</h1>
          <p className="text-sm text-muted-foreground mt-2">{t("home.subtitle")}</p>
        </div>

        {/* Auth Form */}
        <div className="w-full">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardContent className="p-6 space-y-4">
              {/* Mode Toggle */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
                    mode === "login"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-muted-foreground hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                  onClick={() => { setMode("login"); setFormError(""); }}
                >
                  {t("auth.login")}
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
                    mode === "register"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-muted-foreground hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                  onClick={() => { setMode("register"); setFormError(""); }}
                >
                  {t("auth.register")}
                </button>
              </div>

              {/* Error */}
              {formError && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("auth.username")}</label>
                  <Input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder={t("auth.usernamePlaceholder")}
                    className="h-11"
                    required
                    autoComplete="username"
                  />
                </div>

                {mode === "register" && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("auth.email")}</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t("auth.emailPlaceholder")}
                      className="h-11"
                      required
                      autoComplete="email"
                    />
                  </div>
                )}

                {mode === "register" && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("profile.displayName")} ({t("common.optional")})</label>
                    <Input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder={t("profile.displayNamePlaceholder")}
                      className="h-11"
                    />
                  </div>
                )}

                {mode === "register" && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("profile.grade")} ({t("common.optional")})</label>
                    <Input
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                      placeholder={t("profile.gradePlaceholder")}
                      className="h-11"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("auth.password")}</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t("auth.passwordPlaceholder")}
                    className="h-11"
                    required
                    minLength={6}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base rounded-full"
                  disabled={submitting || authLoading}
                >
                  {submitting || authLoading ? t("common.loading") : mode === "login" ? t("auth.login") : t("auth.register")}
                </Button>
              </form>
              
              {/* Social Login Placeholder - for future enhancement */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t("auth.or")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Preview */}
        <div className="mt-8">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20">
              <Mic className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <div className="text-[10px] font-medium text-muted-foreground">{t("home.recordAudio")}</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20">
              <BrainCircuit className="w-5 h-5 mx-auto mb-1 text-purple-500" />
              <div className="text-[10px] font-medium text-muted-foreground">{t("home.organize")}</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20">
              <LayoutList className="w-5 h-5 mx-auto mb-1 text-orange-500" />
              <div className="text-[10px] font-medium text-muted-foreground">{t("home.review")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}