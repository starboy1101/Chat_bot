import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "../../../components/ui/Button";
import { CheckCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const RegisterSuccessModal = ({ open, onClose, onProceed }: Props) => {
  const okButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus OK button
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        okButtonRef.current?.focus();
      }, 50);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm animate-in fade-in-0 zoom-in-95">
        <DialogHeader className="flex items-center space-x-3">
          <CheckCircle className="text-green-500" size={32} />
          <DialogTitle className="text-lg font-semibold">
            Registration Successful
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Your account has been created successfully.  
          Would you like to proceed to the login page?
        </p>

        <DialogFooter className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            className="px-4"
            onClick={onClose}
          >
            Stay here
          </Button>

          <Button
            variant="default"
            className="px-4"
            ref={okButtonRef}
            onClick={onProceed}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterSuccessModal;
