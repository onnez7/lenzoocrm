
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Minus, DollarSign } from "lucide-react";

interface SangriaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, description: string) => void;
}

export const SangriaDialog = ({ isOpen, onClose, onConfirm }: SangriaDialogProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido para a retirada.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Descrição obrigatória",
        description: "Por favor, informe o motivo da retirada.",
        variant: "destructive",
      });
      return;
    }

    onConfirm(numAmount, description.trim());
    setAmount("");
    setDescription("");
    onClose();

    toast({
      title: "Sangria registrada",
      description: `Retirada de R$ ${numAmount.toFixed(2)} registrada com sucesso.`,
    });
  };

  const handleCancel = () => {
    setAmount("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Minus className="h-5 w-5 text-red-600" />
            Sangria do Caixa
          </DialogTitle>
          <DialogDescription>
            Registre uma retirada de dinheiro do caixa. Esta operação será registrada no histórico.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Valor da Retirada</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Motivo da Retirada</Label>
            <Textarea
              id="description"
              placeholder="Ex: Troco para cliente, pagamento fornecedor, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Esta operação irá reduzir o valor disponível no caixa e será registrada no histórico de movimentações.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            <Minus className="h-4 w-4 mr-2" />
            Confirmar Sangria
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
