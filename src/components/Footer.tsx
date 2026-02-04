import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="py-12 px-4 bg-surface border-t border-border">
            <div className="container mx-auto max-w-7xl">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-glow">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xl font-bold text-gradient-primary">Hangoutly</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Safe, verified companionship for meaningful connections.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/browse" className="hover:text-primary transition-colors">Browse</Link></li>
                            <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                            <li><Link to="/safety" className="hover:text-primary transition-colors">Safety</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Connect</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><a href="mailto:support@hangoutly.com" className="hover:text-primary transition-colors">Support</a></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
                    <p>&copy;{new Date().getFullYear()}  Hangoutly. All rights reserved.</p>
                    <p>Made with ❤️ by <a href="https://github.com/hehewhy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Groot</a></p>
                </div>
            </div>
        </footer>
    );
};
