import { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/web3-context";

export function useAdminStatus() {
  const { wallet } = useWeb3();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isArbiter, setIsArbiter] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      if (!wallet.isConnected || !wallet.address) {
        setIsAdmin(false);
        setIsOwner(false);
        setIsArbiter(false);
        setLoading(false);
        return;
      }

      try {
        // Check if connected address matches the admin/deployer address
        const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "0x3Be7fbBDbC73Fc4731D60EF09c4BA1A94DC58E41";
        const isConnectedAddressAdmin = wallet.address.toLowerCase() === adminAddress.toLowerCase();
        setIsAdmin(isConnectedAddressAdmin);
        setIsOwner(isConnectedAddressAdmin); // For Luminar, owner = admin
        setIsArbiter(false); // Not using arbiters for now
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setIsOwner(false);
        setIsArbiter(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [wallet.isConnected, wallet.address]);

  return {
    isAdmin,
    isOwner,
    isArbiter,
    loading,
  };
}
