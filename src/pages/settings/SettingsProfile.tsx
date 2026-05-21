
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Building2, Save, Upload, MapPin, Phone, Mail, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StoreProfile {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  website: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

const initialProfile: StoreProfile = {
  name: "Ótica Visão Clara",
  cnpj: "12.345.678/0001-90",
  email: "contato@oticavisaoclara.com.br",
  phone: "(11) 3456-7890",
  address: "Rua das Lentes, 123",
  city: "São Paulo",
  state: "SP",
  zipCode: "01234-567",
  description: "Especializada em óculos de grau, sol e lentes de contato. Atendimento personalizado com tecnologia de ponta.",
  website: "www.oticavisaoclara.com.br",
  socialMedia: {
    instagram: "@oticavisaoclara",
    facebook: "oticavisaoclara",
    whatsapp: "(11) 99999-9999"
  },
  businessHours: {
    monday: "08:00 - 18:00",
    tuesday: "08:00 - 18:00",
    wednesday: "08:00 - 18:00",
    thursday: "08:00 - 18:00",
    friday: "08:00 - 18:00",
    saturday: "08:00 - 14:00",
    sunday: "Fechado"
  }
};

const SettingsProfile = () => {
  const [profile, setProfile] = useState<StoreProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    toast({
      title: "Perfil atualizado",
      description: "As informações da ótica foram salvas com sucesso.",
    });
  };

  const handleInputChange = (field: keyof StoreProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform: keyof StoreProfile['socialMedia'], value: string) => {
    setProfile(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleBusinessHoursChange = (day: keyof StoreProfile['businessHours'], value: string) => {
    setProfile(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil da Ótica</h1>
        <p className="text-muted-foreground">
          Configure as informações básicas da sua ótica
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Dados principais da sua ótica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Ótica</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome da sua ótica"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={profile.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contato@suaotica.com.br"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 3456-7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={profile.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva sua ótica..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={profile.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="www.suaotica.com.br"
              />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
            <CardDescription>
              Localização da sua ótica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="São Paulo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={profile.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={profile.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redes Sociais */}
        <Card>
          <CardHeader>
            <CardTitle>Redes Sociais</CardTitle>
            <CardDescription>
              Links para suas redes sociais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={profile.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  placeholder="@suaotica"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={profile.socialMedia.facebook}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  placeholder="suaotica"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={profile.socialMedia.whatsapp}
                  onChange={(e) => handleSocialMediaChange('whatsapp', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horário de Funcionamento */}
        <Card>
          <CardHeader>
            <CardTitle>Horário de Funcionamento</CardTitle>
            <CardDescription>
              Configure os horários de atendimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(profile.businessHours).map(([day, hours]) => {
                const dayLabels: Record<string, string> = {
                  monday: "Segunda-feira",
                  tuesday: "Terça-feira",
                  wednesday: "Quarta-feira",
                  thursday: "Quinta-feira",
                  friday: "Sexta-feira",
                  saturday: "Sábado",
                  sunday: "Domingo"
                };

                return (
                  <div key={day} className="space-y-2">
                    <Label htmlFor={day}>{dayLabels[day]}</Label>
                    <Input
                      id={day}
                      value={hours}
                      onChange={(e) => handleBusinessHoursChange(day as keyof StoreProfile['businessHours'], e.target.value)}
                      placeholder="08:00 - 18:00 ou Fechado"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsProfile;
