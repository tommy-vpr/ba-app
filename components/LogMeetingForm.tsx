"use client";

import { startTransition, useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useLogMeetingModal } from "@/context/LogMeetingModalContext";
import { useContactDetail } from "@/hooks/useContactDetail";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
// import { logMeeting } from "@/app/actions/logMeeting";
import Spinner from "@/components/Spinner";

const formSchema = z.object({
  newFirstName: z.string().min(1, "First name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  body: z.string().min(1, "Meeting notes are required"),
  l2Status: z.enum(["pending visit", "visit requested by rep", "dropped off"]),
});

type FormValues = z.infer<typeof formSchema>;

import { useBrand } from "@/context/BrandContext";
import { useContactContext } from "@/context/ContactContext";
import { logMeeting } from "@/app/actions/logMeeting";

export function LogMeetingForm({
  contactId,
  contactFirstName,
  contactJobTitle,
  contactCompany,
  contactStatus,
}: {
  contactId: string;
  contactFirstName?: string;
  contactJobTitle?: string;
  contactCompany?: string;
  contactStatus?: string;
}) {
  const { brand } = useBrand();
  const { setLogOpen, fetchPage, page, loading, logListRef } =
    useContactContext();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newFirstName: contactFirstName || "",
      jobTitle: contactJobTitle || "",
      body: "",
      l2Status: (contactStatus as any) || "pending visit",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const meeting = await logMeeting({
          brand,
          contactId,
          title: "BA Sample Drop",
          body: values.body,
          newFirstName: values.newFirstName,
          jobTitle: values.jobTitle,
          l2Status: values.l2Status,
        });

        logListRef?.current?.addOptimisticMeeting(meeting); // ✅ Now valid

        toast.success("Meeting logged and task created");
        setLogOpen(false);
        fetchPage(page); // Re-fetch current page to get updated status
      } catch (err) {
        console.error(err);
        toast.error("Failed to log meeting");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="newFirstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact's First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Notes</FormLabel>
              <FormControl>
                <Textarea {...field} className="h-32" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="l2Status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <div className="space-y-2">
                {["pending visit", "visit requested by rep", "dropped off"].map(
                  (status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="l2Status"
                        value={status}
                        checked={field.value === status}
                        onChange={() => field.onChange(status)}
                        className="hidden peer"
                      />
                      <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex items-center justify-center peer-checked:border-green-400 peer-checked:bg-green-400">
                        <div className="w-2.5 h-2.5 rounded-full opacity-0 peer-checked:opacity-100 bg-white"></div>
                      </div>
                      <span className="capitalize">{status}</span>
                    </label>
                  )
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <OwnerSelect brand={brand} onSelect={setSelectedOwnerId} /> */}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <div className="flex items-center gap-1">
              <Spinner size="4" />
              Submitting
            </div>
          ) : (
            "Log Meeting"
          )}
        </Button>
      </form>
    </Form>
  );
}
