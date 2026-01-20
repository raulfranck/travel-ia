import Link from 'next/link';
import { MessageCircle, Sparkles, DollarSign, Map, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">TravelBot Pro</span>
          </div>
          <div className="space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Começar
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Planeje Viagens Incríveis com{' '}
            <span className="text-primary-600">Inteligência Artificial</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Seu assistente pessoal de viagens no WhatsApp. Roteiros personalizados, gestão de
            gastos e reservas - tudo em um só lugar.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="https://wa.me/14155238886?text=join%20your-sandbox-code"
              target="_blank"
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
            >
              <MessageCircle className="w-6 h-6" />
              Testar no WhatsApp (Sandbox)
            </Link>
            <Link
              href="/dashboard"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition"
            >
              Ver Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Por que TravelBot Pro?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Sparkles className="w-12 h-12 text-primary-600" />}
            title="IA Personalizada"
            description="Roteiros únicos gerados por IA baseados em suas preferências, orçamento e estilo de viagem."
          />
          <FeatureCard
            icon={<DollarSign className="w-12 h-12 text-green-600" />}
            title="Gestão de Gastos"
            description="Rastreie despesas, escaneie recibos e mantenha seu orçamento sempre sob controle."
          />
          <FeatureCard
            icon={<Map className="w-12 h-12 text-purple-600" />}
            title="Roteiros Detalhados"
            description="Planejamento dia a dia com atrações, restaurantes e dicas locais personalizadas."
          />
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-yellow-600" />}
            title="Respostas Rápidas"
            description="Respostas em menos de 3 segundos via WhatsApp. Planeje suas viagens em tempo real."
          />
          <FeatureCard
            icon={<MessageCircle className="w-12 h-12 text-blue-600" />}
            title="100% no WhatsApp"
            description="Sem apps extras. Converse naturalmente e planeje tudo direto pelo WhatsApp."
          />
          <FeatureCard
            icon={<Shield className="w-12 h-12 text-red-600" />}
            title="Seguro e Privado"
            description="Seus dados protegidos com criptografia. 100% conforme LGPD e GDPR."
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Planos e Preços</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            name="Free"
            price="R$ 0"
            period="/mês"
            features={['1 viagem por mês', 'Roteiros básicos', 'Suporte por email']}
            cta="Começar Grátis"
            highlighted={false}
          />
          <PricingCard
            name="Basic"
            price="R$ 19"
            period="/mês"
            features={[
              '10 viagens por mês',
              'Roteiros avançados',
              'Gestão de gastos',
              'Suporte prioritário',
            ]}
            cta="Começar Agora"
            highlighted={true}
          />
          <PricingCard
            name="Pro"
            price="R$ 49"
            period="/mês"
            features={[
              'Viagens ilimitadas',
              'Roteiros premium',
              'Assistente 24/7',
              'Integrações avançadas',
              'Relatórios detalhados',
            ]}
            cta="Começar Pro"
            highlighted={false}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 TravelBot Pro. Todos os direitos reservados.
          </p>
          <div className="mt-4 space-x-6">
            <Link href="/privacy" className="text-gray-400 hover:text-white">
              Privacidade
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white">
              Termos
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white">
              Contato
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  highlighted,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}) {
  return (
    <div
      className={`bg-white p-8 rounded-xl shadow-lg ${highlighted ? 'ring-4 ring-primary-600 scale-105' : ''}`}
    >
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-gray-600">{period}</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className={`w-full py-3 rounded-lg font-semibold transition ${
          highlighted
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

