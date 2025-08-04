import 'use-client'; // <-- ensure this file cannot be imported from the client
import { caller } from '../../utils/trpc';
import { Uppy } from '@uppy/core';
import UppyDashboard from '@uppy/dashboard';
import AwsS3 from '@uppy/aws-s3';
import { useState } from 'react';


export default async function DashBoard() {
  const data = await caller.hello();
  const [uppy, setUppy] = useState(() => {
    const uppy = new Uppy();
    uppy.use(UppyDashboard, {
      target: 'body',
      inline: true,
      // height: 470,
    });
    uppy.use(AwsS3, {
      getUploadParameters: async (file: any) => {
        const response = await fetch('/api/uppy/upload', {
          method: 'POST',
          body: JSON.stringify({ file }),
        });
        return await response.json();
      },
    } as any);
    return uppy;
  });
  return (
    <div>
      <h1>uppyUpload</h1>
      <div id="uppy-dashboard">
        <input type="file" id="uppy-input" onChange={(e) => {
          if (e.target.files) {
            uppy.addFile(e.target.files[0]);
          }
        }} />
      </div>
    </div>
  )
}