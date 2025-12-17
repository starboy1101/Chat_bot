interface GuestAccessModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const GuestAccessModal = ({ open, onClose, onLogin }: GuestAccessModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-card rounded-xl shadow-xl p-6 w-80 animate-in fade-in zoom-in">
        <h2 className="text-lg font-semibold mb-2 text-foreground">
          Login Required
        </h2>

        <p className="text-sm text-muted-foreground mb-6">
          Please login to access your profile and settings.
        </p>

        <div className="flex flex-col space-y-3">
          {/* Login Button */}
          <button
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition"
            onClick={onLogin}
          >
            Login
          </button>

          {/* Continue as Guest Button */}
          <button
            className="w-full border border-border py-2 rounded-lg hover:bg-muted transition"
            onClick={onClose}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestAccessModal;
