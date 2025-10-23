
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="py-6 mt-12">
            <div className="container mx-auto text-center text-sm text-gray-500">
                <p>This tool provides AI-generated suggestions and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns or before starting a new treatment plan.</p>
                <p className="mt-2">&copy; {new Date().getFullYear()} RecoverX. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;