import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { 
  ShoppingCartIcon, 
  ChartBarIcon, 
  CubeIcon, 
  DocumentTextIcon,
  MicrophoneIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Small delay to ensure state is fully updated
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } else if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32" style={{borderBottom: '2px solid hsl(var(--primary))'}}></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const features = [
    {
      icon: ShoppingCartIcon,
      title: 'Smart Billing',
      description: 'QR code scanning, voice commands, and instant invoice generation',
    },
    {
      icon: CubeIcon,
      title: 'Inventory Management',
      description: 'Track products, stock levels, and manage multiple branches',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Reports',
      description: 'Comprehensive reports and AI-powered insights',
    },
    {
      icon: DocumentTextIcon,
      title: 'Khata Book',
      description: 'Track payments, credits, and manage customer accounts',
    },
    {
      icon: MicrophoneIcon,
      title: 'Voice Commands',
      description: 'Add products and create invoices using voice commands',
    },
    {
      icon: QrCodeIcon,
      title: 'QR Code Integration',
      description: 'Generate and scan QR codes for quick product identification',
    },
  ];

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, hsl(var(--primary) / 0.05), hsl(var(--secondary) / 0.05))'}}>
      {/* Header */}
      <header className="backdrop-blur-sm" style={{backgroundColor: 'hsl(var(--background) / 0.8)', borderBottom: '1px solid hsl(var(--border))'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold" style={{color: 'hsl(var(--primary))'}}>
                  InventoryPro
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{color: 'hsl(var(--foreground))'}}>
            Complete Inventory
            <span style={{color: 'hsl(var(--primary))'}}> Management</span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{color: 'hsl(var(--muted-foreground))'}}>
            Streamline your business with our all-in-one inventory management solution. 
            Features smart billing, voice commands, QR codes, and AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="text-lg px-8 py-3"
            >
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-3"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12" style={{color: 'hsl(var(--foreground))'}}>
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
                style={{backgroundColor: 'hsl(var(--card))'}}
              >
                <div className="flex items-center mb-4">
                  <feature.icon className="h-8 w-8 mr-3" style={{color: 'hsl(var(--primary))'}} />
                  <h3 className="text-xl font-semibold" style={{color: 'hsl(var(--card-foreground))'}}>
                    {feature.title}
                  </h3>
                </div>
                <p style={{color: 'hsl(var(--muted-foreground))'}}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 rounded-2xl p-8 text-center" style={{backgroundColor: 'hsl(var(--primary))'}}>
          <h2 className="text-3xl font-bold mb-4" style={{color: 'hsl(var(--primary-foreground))'}}>
            Ready to Transform Your Business?
          </h2>
          <p className="mb-8 text-lg" style={{color: 'hsl(var(--primary-foreground) / 0.8)'}}>
            Join thousands of businesses already using our platform
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/register')}
            className="text-lg px-8 py-3"
          >
            Get Started Now
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20" style={{backgroundColor: 'hsl(var(--background))', borderTop: '1px solid hsl(var(--border))'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center" style={{color: 'hsl(var(--muted-foreground))'}}>
            <p>&copy; 2024 InventoryPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
