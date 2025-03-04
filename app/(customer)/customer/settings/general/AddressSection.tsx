"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateAddressSchema, UpdateAddressValues } from "./validations";
import { updateAddress } from "./actions";
import { toast } from "sonner";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Home, MapPin, Building, Globe, Loader2 } from "lucide-react";

interface AddressSectionProps {
  userData: {
    streetAddress: string;
    suburb?: string | null;
    townCity: string;
    postcode: string;
    country: string;
  };
  onSuccess?: () => void;
}

export function AddressSection({ userData, onSuccess }: AddressSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateAddressValues>({
    resolver: zodResolver(updateAddressSchema),
    defaultValues: {
      streetAddress: userData.streetAddress,
      suburb: userData.suburb || "",
      townCity: userData.townCity,
      postcode: userData.postcode,
      country: userData.country,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: UpdateAddressValues) => {
    setIsSubmitting(true);
    try {
      const result = await updateAddress(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Address updated successfully");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error("Failed to update address");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden border border-border/40 bg-card/80 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-accent" />
          <CardTitle className="text-xl font-semibold">
            Address Information
          </CardTitle>
        </div>
        <CardDescription>Update your address details</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        className="pl-9"
                        placeholder="Street address"
                        disabled={isSubmitting}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="suburb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suburb (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        className="pl-9"
                        placeholder="Suburb"
                        disabled={isSubmitting}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="townCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Town/City</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          className="pl-9"
                          placeholder="Town or city"
                          disabled={isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          className="pl-9"
                          placeholder="Postcode"
                          disabled={isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <SelectTrigger className="pl-9">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="southAfrica">South Africa</SelectItem>
                      <SelectItem value="namibia">Namibia</SelectItem>
                      <SelectItem value="botswana">Botswana</SelectItem>
                      <SelectItem value="zimbabwe">Zimbabwe</SelectItem>
                      <SelectItem value="mozambique">Mozambique</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="flex justify-end px-0 pt-4">
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-accent hover:bg-accent/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
