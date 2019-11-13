import React from 'react';
import axios from 'axios';
import { Upload, Icon, Button, Radio, InputNumber, Card, message } from 'antd';
import './App.css';
const { Dragger } = Upload;
const config = require('./config.json');

interface IAppState {
  isSubmitting: boolean;
  fileList: any[];
  fileListBase64: any[];
  resizeValue: number | undefined;
  resizeType: string;
}
class App extends React.PureComponent <{}, IAppState> {
  state = {
    isSubmitting: false,
    fileList: [],
    fileListBase64: [],
    resizeValue: 50,
    resizeType: 'percentage'
  }
  componentDidMount() {
      window.addEventListener("dragover", function(e){
          e.preventDefault();
      }, false);
      window.addEventListener("drop", function(e){
          e.preventDefault();
      }, false);
  }
  componentWillUnmount() {
      window.removeEventListener("dragover", function(e){
          e.preventDefault();
      }, false);
      window.addEventListener("drop", function(e){
          e.preventDefault();
      }, false);
  }
  handleSubmitImages = () => {
    const { fileListBase64, resizeType, resizeValue } = this.state;
    const reqBody = { 
      fileList: fileListBase64,
      resizeType, 
      resizeValue
    };
    message.info("Resizing images, please wait...")
    this.setState({ isSubmitting: true });
    axios.post(`${config.server_url}/resize`, reqBody)
      .then((response: any) => {
        this.setState({ isSubmitting: false });
        const { data: { data } } = response;
        var blob = new Blob([new Uint8Array(data).buffer], { type: 'application/zip' });
        var url = URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = url;
        tempLink.setAttribute('download', 'resized-images');
        tempLink.click();
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
  render() {
    const { isSubmitting, fileList, resizeType, resizeValue } = this.state;
    const props = {
      accept: "image/*",
      name: 'file',
      multiple: true,
      beforeUpload: (file: any) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => { 
          const fileData = {
            fileName: file.name,
            uid: file.uid,
            fileData: reader.result
          };
          this.setState(state => ({
            fileList: [...state.fileList, file],
            fileListBase64: [...state.fileListBase64, fileData]
          }));
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
                    onChange={(e: any) => { this.setState({ resizeType: e.target.value }); }}
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
                  onChange={(value: number | undefined) => { this.setState({ resizeValue: value }); }}
                />
                <span>{resizeType === "percentage" ? " %" : " px"}</span>
              </div>
            </React.Fragment>
          }
          extra={
            <Button 
              type="primary" onClick={this.handleSubmitImages}
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
          </Dragger>
        </Card>
      </div>
    )
  }
}

export default App;
