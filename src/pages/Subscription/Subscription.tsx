import { useEffect, useState } from "react";
import { subscriptionService, SubscriptionPlan, Subscription } from "@/services/subscriptionService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function FranchiseSubscription() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [mySubscription, setMySubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) return;
    setLoading(true);

    Promise.all([
      subscriptionService.getAllPlans(token),
      subscriptionService.getAllSubscriptions(token)
    ])
      .then(([plansData, allSubs]) => {
        setPlans(plansData);
        const mySub = allSubs.find(
          (sub: Subscription) => sub.franchise_id === user.franchiseId
        );
        setMySubscription(mySub || null);
      })
      .catch((err) => {
        console.error("Erro ao buscar planos ou assinaturas:", err);
        toast({ title: "Erro ao carregar planos", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [token, user, toast]);

  // Só faz o return condicional DEPOIS dos hooks
  if (!user || user.role !== "FRANCHISE_ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span>Você não tem permissão para acessar esta página.</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span>Carregando planos...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Escolha seu plano</h1>
      {mySubscription && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Seu plano atual</CardTitle>
            <CardDescription>
              {mySubscription.plan_name} — Status: <b>{mySubscription.status}</b>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Vigência: {new Date(mySubscription.current_period_start).toLocaleDateString("pt-BR")}
              {" "}até{" "}
              {new Date(mySubscription.current_period_end).toLocaleDateString("pt-BR")}
            </p>
            <p>
              Valor: <b>R$ {mySubscription.amount.toFixed(2)}</b> por mês
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <Card key={plan.id} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 mb-2">
                {plan.is_free ? "Grátis" : `R$ ${plan.price.toFixed(2)}/mês`}
              </div>
              <ul className="text-sm text-gray-600 mb-4">
                {plan.features && plan.features.slice(0, 3).map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
                {plan.features && plan.features.length > 3 && (
                  <li>+{plan.features.length - 3} mais recursos</li>
                )}
              </ul>
              <Button
                disabled={mySubscription && mySubscription.plan_id === plan.id}
                onClick={() => handleSubscribe(plan.id)}
                className="w-full"
              >
                {mySubscription && mySubscription.plan_id === plan.id
                  ? "Plano Atual"
                  : "Assinar este plano"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}