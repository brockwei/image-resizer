import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Upload, Icon, Button, Radio, InputNumber, Card, message } from 'antd';
import './App.css';

const { Dragger } = Upload;
const config = require('./config.json');

const App = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [fileListBase64, setFileListBase64] = useState<any[]>([]);
  const [resizeValue, setResizeValue] = useState<number | undefined>(50);
  const [resizeType, setResizeType] = useState('percentage');

  useEffect(() => {
    window.addEventListener("dragover", function(e){
        e.preventDefault();
    }, false);
    window.addEventListener("drop", function(e){
        e.preventDefault();
    }, false);

    return () => {
      window.removeEventListener("dragover", function(e){
          e.preventDefault();
      }, false);
      window.addEventListener("drop", function(e){
          e.preventDefault();
      }, false);
    }
  }, []);

  const handleSubmitImages = () => {
    const reqBody = { 
      fileList: fileListBase64,
      resizeType, 
      resizeValue
    };
    console.log("test", Math.round((fileList.reduce((a, b: any) => a+b.size, 0)/10240)/100), "megabytes");
    if (Math.round((fileList.reduce((a, b: any) => a+b.size, 0)/10240)/100) >= 100) {
      return message.error("File size over 100mb");
    }
    message.info("Resizing images, please wait...");
    setSubmitting(true);
    axios.post(`${config.server_url}/resize`, reqBody, { })
      .then((response: AxiosResponse) => {
        setSubmitting(false);
        const { data: { data } } = response;
        var blob = new Blob([new Uint8Array(data).buffer], { type: 'application/zip' });
        var url = URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = url;
        tempLink.setAttribute('download', 'resized-images');
        tempLink.click();
      })
      .catch((error: AxiosError) => {
        console.log("error", error);
      });
  }

  const props = {
    accept: "image/*",
    name: 'file',
    multiple: true,
    beforeUpload: (file: any) => {
      let reader = new FileReader();
      reader.readAsDataURL(file as any);
      reader.onloadend = () => { 
        const fileData = {
          fileName: file.name,
          uid: file.uid,
          fileData: reader.result
        };
        setFileList([...fileList, file]);
        setFileListBase64([...fileListBase64, fileData]);
      }
      return false;
    },
    fileList
  };

  return (
    <div className="App">
      <Card
        bordered={false}
        title={
          <React.Fragment>
          <div style={{ display: 'inline-block', marginRight: '20px' }}>
            <p className="label">Resize by:</p>
            <Radio.Group
              buttonStyle="solid"
              value={resizeType} 
              onChange={(e) => { 
                setResizeType(e.target.value);
              }}
            >
              <Radio.Button value="percentage">Percentage</Radio.Button>
              <Radio.Button value="width">Width</Radio.Button>
            </Radio.Group>
            </div>
            <div style={{ display: 'inline-block', marginRight: '20px' }}>
              <p className="label">{`${resizeType[0].toUpperCase()}${resizeType.substring(1)}`}</p>
              <InputNumber 
                style={{ width: '100px' }}
                min={1} 
                value={resizeValue}
                onChange={(value: number | undefined) => { 
                  setResizeValue(value);
                }}
              />
              <span>{resizeType === "percentage" ? " %" : " px"}</span>
            </div>
          </React.Fragment>
        }
        extra={
          <Button 
            type="primary" onClick={handleSubmitImages}
            disabled={fileList.length === 0}
            loading={isSubmitting}
          >
            Convert and Download!
          </Button>
        }
        style={{ margin: '50px' }}
        headStyle={{ padding: 0 }}
        bodyStyle={{ padding: 0 }}
      >
        <Dragger {...props} style={{ height: '300px' }}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">Click or drag your images to this area to upload</p>
          <p className="ant-upload-hint">Max combined file size: 100mb</p>
        </Dragger>
      </Card>
    </div>
  )
}

export default App;
