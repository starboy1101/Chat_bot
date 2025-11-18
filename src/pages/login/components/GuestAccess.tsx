import Button from '../../../components/ui/Button';
import { GuestAccessProps } from '../types';

const GuestAccess = ({ onGuestAccess, className = '' }: GuestAccessProps) => {
  return (
    <div className={`text-center ${className}`}>

      <div className="mt-6">
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={onGuestAccess}
          iconName="UserCheck"
          iconPosition="left"
          className="h-12 rounded-xl"
        >
          Continue as Guest
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Try ChatBot Pro without creating an account. Limited features available.
        </p>
      </div>
    </div>
  );
};

export default GuestAccess;