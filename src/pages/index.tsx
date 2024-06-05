import Image from "next/image";
import { Inter } from "next/font/google";
import { IoCloudUploadOutline } from "react-icons/io5";
import { IoMdCloseCircle } from "react-icons/io";
import { Dispatch, SetStateAction, useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const inter = Inter({ subsets: ["latin"] });

const handleFileChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setfiles: Dispatch<
    SetStateAction<
      | {
          name: string;
          type: string;
          base64String: string;
        }
      | undefined
    >
  >
) => {
  const file = event.target.files?.[0];
  if (
    (file && file.type.startsWith("audio/")) ||
    (file && file.type.startsWith("video/"))
  ) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64String = (e?.target?.result as string).split(",")[1]; // Get the base64 string
      setfiles({
        name: file.name,
        type: file.type,
        base64String: base64String,
      });
    };
    reader.readAsDataURL(file); // Read file as Data URL
  } else {
    // Handle invalid file type (e.g., display an error message)
    console.error("Invalid file type. Please select an audio file.");
  }
};

const transcribeAPI = async (data: { base64: string; name: string }) => {
  let res = await axios.post("/api/transcribe", {
    file: data.base64,
  });
  return res.data.output.text;
};

export default function Home() {
  const [drag, setdrag] = useState(false);
  const [selectedFile, setselectedFile] = useState<{
    name: string;
    type: string;
    base64String: string;
  }>();

  let {
    mutate: initTranscribe,
    isPending,
    isSuccess,
    data,
  } = useMutation({
    mutationFn: transcribeAPI,
    onSuccess: (data) => {
      // console.log(data);
    },
    onError: (er) => {
      console.log(er);
    },
  });

  return (
    <main
      className={`flex w-full h-screen justify-center items-center relative overflow-hidden`}
    >
      <div
        style={
          drag
            ? {
                filter: "brightness(0.5)",
              }
            : {}
        }
        className="dotted flex w-[1000%] h-[1000%] absolute move z-0"
      ></div>
      <div className="flex-col gap-4  z-10 flex bg-white shadow-lg w-[500px] h-[340px] rounded-lg border-[3px] border-dashed border-[#444df784] p-6">
        <label
          htmlFor="file"
          className="flex relative justify-center items-center w-full h-full bg-[#444df734] rounded-lg"
        >
          {isPending ? (
            <>
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-14 h-14 text-white animate-spin  fill-[#444df784]"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>
            </>
          ) : (
            <IoCloudUploadOutline className="text-white h-28 w-28" />
          )}
          <input
            onDragEnter={(e) => {
              setdrag(true);
            }}
            onDrop={() => {
              setdrag(false);
            }}
            accept="audio/*,video/*"
            onChange={(e) => handleFileChange(e, setselectedFile)}
            className="opacity-0 absolute h-full w-full bg-red-300 cursor-pointer"
            id="file"
            type="file"
          />
        </label>
        <>
          {isPending ? (
            <>
              <div className="flex h-8 justify-between items-center">
                <h1 className="text-[20px] text-[#444df784] font-medium">
                  Processing..
                </h1>
              </div>
            </>
          ) : (
            <>
              {selectedFile ? (
                <div className="flex h-9 justify-between items-center">
                  <p className="text-[#444df784]">{selectedFile.name}</p>
                  <h1
                    onClick={() => {
                      initTranscribe({
                        base64: selectedFile.base64String,
                        name: selectedFile.name,
                      });
                    }}
                    className="text-[12px] flex items-center justify-center cursor-pointer h-full text-white rounded-md bg-[#444df784] font-normal px-4"
                  >
                    Transcribe
                  </h1>
                </div>
              ) : (
                <div className="flex h-8 justify-between items-center">
                  <h1 className="text-[20px] text-[#444df784] font-medium">
                    Upload Audio to transcribe
                  </h1>
                </div>
              )}
            </>
          )}
        </>
      </div>
      {isSuccess && <TranscriptionResult transcript={data} />}
    </main>
  );
}

const gptAPI = async (data: { transcript: string }) => {
  let { transcript } = data;
  let res = await axios.post("/api/gpt", {
    messages: [
      { role: "user", content: transcript },
      {
        role: "user",
        content: "summarize the given text in less thank 100 words",
      },
    ] as message[],
  });
  let resMsg = res.data.result.message as message;
  return resMsg;
};

const TranscriptionResult = ({ transcript }: { transcript: string }) => {
  let {
    isPending,
    isSuccess,
    mutate: initSummary,
    data,
  } = useMutation({
    mutationFn: gptAPI,
    onSuccess: (res) => {
      console.log(res);
    },
    onError: (er) => {
      console.log(er);
    },
  });

  return (
    <div className="flex w-full h-full left-0 right-0 top-0 absolute overflow-y-auto justify-center py-12">
      <div className="relative z-20 flex flex-col w-[800px] h-fit  bg-white  rounded-lg border-[3px] border-dashed border-[#444df784] p-8">
        <IoMdCloseCircle
          onClick={() => {
            location.reload();
          }}
          className="absolute right-0 top-0 m-4 text-[#444df784] text-[40px] cursor-pointer hover:opacity-60"
        />
        {isSuccess && (
          <div className="w-full mb-4">
            <h1 className="text-[24px] text-[#444df784] font-medium mb-2">
              Generated Summary
            </h1>
            <p className="text-sm bg-[#444df731]  leading-[160%]  p-4 rounded-lg">
              {data?.content}
            </p>
          </div>
        )}
        <div className="flex h-8 justify-between items-center mb-2">
          <h1 className="text-[24px] text-[#444df784] font-medium ">
            Transcript
          </h1>
          {isPending ? (
            <>
              <h1 className="text-[12px] mr-12 gap-4 flex items-center justify-center cursor-pointer h-full text-white rounded-md bg-[#444df757] font-normal px-4">
                <Loader sizeInPx={18} /> Generating Summary..
              </h1>
            </>
          ) : (
            <>
              {!isSuccess && (
                <h1
                  onClick={() => initSummary({ transcript })}
                  className="text-[12px] mr-12  flex items-center justify-center cursor-pointer h-full text-white rounded-md bg-[#444df784] font-normal px-4"
                >
                  Generate summary
                </h1>
              )}
            </>
          )}
        </div>
        <p className="text-sm  leading-[160%]  ">{transcript}</p>
      </div>
    </div>
  );
};

const Loader = ({ sizeInPx }: { sizeInPx: number }) => {
  return (
    <div role="status">
      <svg
        style={{
          height: `${sizeInPx}px`,
          width: `${sizeInPx}px`,
        }}
        aria-hidden="true"
        className="w-14 h-14 text-white animate-spin  fill-[#444df784]"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  );
};
