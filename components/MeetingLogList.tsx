"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { EditMeetingModal } from "./EditMeetingModal";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteMeetingModal } from "./DeleteMeetingModal";
import moment from "moment";
import { IconCalendarWeekFilled } from "@tabler/icons-react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export const MeetingLogList = forwardRef(function MeetingLogList(
  { contactId }: { contactId: string },
  ref
) {
  const {
    data: meetings,
    mutate,
    isLoading,
  } = useSWR<any[]>(`/api/meetings/${contactId}`, fetcher, {
    revalidateOnFocus: false,
  });

  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(
    null
  );

  const toggleCollapse = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const addOptimisticMeeting = (newMeeting: any) => {
    const meetingWithId = {
      ...newMeeting,
      id: newMeeting.id || `temp-${Date.now()}`,
    };

    console.log("🧪 Pushing formatted meeting:", meetingWithId);

    mutate((prev = []) => [meetingWithId, ...prev], false);
  };

  useImperativeHandle(ref, () => ({
    refetch: () => mutate(),
    addOptimisticMeeting,
  }));

  const handleDeleteClick = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setDeleteModalOpen(true);
  };

  const handleEdit = (meeting: any) => {
    setEditingMeeting(meeting);
    setModalOpen(true);
  };

  const renderMeetingCard = (meeting: any) => {
    const isOpen = openId === meeting.id;
    const title = meeting.properties.hs_meeting_title || "Untitled Meeting";

    return (
      <div
        key={meeting.id}
        className="shadow-md shadow-gray-200 dark:shadow-black/30 border border-muted dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 rounded flex flex-col mb-4"
      >
        <div
          onClick={() => toggleCollapse(meeting.id)}
          className="flex justify-between items-start cursor-pointer hover:opacity-80 transition duration-150"
        >
          <h4 className="text-sm text-gray-600 dark:text-[#4493f8] capitalize flex items-center gap-1">
            <IconCalendarWeekFilled size={18} />
            {/* {moment(meeting.properties.hs_timestamp).fromNow()}  */}
            {moment(meeting.properties.hs_timestamp).format("M/D/YYYY")}

            <span className="mx-1 text-gray-400">·</span>

            <span
              className="font-semibold capitalize text-green-400 dark:text-white text-[10px] px-2 py-0.5 rounded-full bg-green-100
             dark:bg-green-600 border border-green-400"
            >
              {meeting.properties.hs_meeting_outcome?.toLowerCase() ||
                "unknown"}
            </span>
          </h4>

          <button className="text-gray-500 hover:text-black dark:hover:text-white transition cursor-pointer">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden min-h-0 mt-2"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {meeting.properties.hs_meeting_body}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(meeting.properties.hs_timestamp).toLocaleString()}
                {" - "}
                <span className="capitalize">
                  {meeting.properties.hs_meeting_outcome?.toLowerCase() ||
                    "unknown"}
                </span>
              </p>
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={() => handleEdit(meeting)}
                  className="text-sm text-green-400 flex items-center px-4 py-1 border border-green-400 hover:bg-green-400 hover:text-black cursor-pointer transition rounded-xs"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(meeting.id)}
                  className="text-sm text-rose-400 flex items-center px-4 py-1 border border-rose-400 hover:bg-red-400 hover:text-black cursor-pointer transition rounded-xs"
                >
                  <Trash className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="w-full md:w-1/2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-[#212830] p-4 rounded shadow-sm mb-4 space-y-3"
            >
              <Skeleton className="h-5 w-3/4 rounded bg-gray-300 dark:bg-[#161b22]" />
            </div>
          ))}
        </div>
        <div className="w-full md:w-1/2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-[#212830] p-4 rounded shadow-sm mb-4 space-y-3"
            >
              <Skeleton className="h-5 w-3/4 rounded bg-gray-300 dark:bg-[#161b22]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!meetings?.length) {
    return (
      <p className="text-sm text-gray-400 mt-4">
        Start by adding a meeting log.
      </p>
    );
  }

  const leftColumn = meetings.filter((_, i) => i % 2 === 0);
  const rightColumn = meetings.filter((_, i) => i % 2 === 1);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-0 md:gap-4 mt-4">
        <div className="flex-1">{leftColumn.map(renderMeetingCard)}</div>
        <div className="flex-1">{rightColumn.map(renderMeetingCard)}</div>
      </div>

      <EditMeetingModal
        open={modalOpen}
        setOpen={setModalOpen}
        meeting={editingMeeting}
        onSave={() => mutate()}
      />

      {selectedMeetingId && (
        <DeleteMeetingModal
          open={deleteModalOpen}
          setOpen={setDeleteModalOpen}
          meetingId={selectedMeetingId}
          onDeleted={() => mutate()}
        />
      )}
    </>
  );
});
