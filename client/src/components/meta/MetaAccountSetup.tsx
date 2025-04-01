import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectMetaAccount } from "./ConnectMetaAccount";
import { CreateMetaAccount } from "./CreateMetaAccount";

interface MetaAccountSetupProps {
  businessName?: string;
  onSuccess?: () => void;
}

export function MetaAccountSetup({ businessName = "", onSuccess }: MetaAccountSetupProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <Tabs defaultValue="connect" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="connect">Connect Existing Account</TabsTrigger>
          <TabsTrigger value="create">Create New Account</TabsTrigger>
        </TabsList>
        <TabsContent value="connect" className="mt-4">
          <ConnectMetaAccount onSuccess={onSuccess} />
        </TabsContent>
        <TabsContent value="create" className="mt-4">
          <CreateMetaAccount businessName={businessName} onSuccess={onSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
}