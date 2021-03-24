import React, { Component } from 'react';
import { Text, SafeAreaView, TextInput, Button, FlatList, View, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import produce from 'immer';
import RNBGD from './indexx';
import styles from './Style';

const testURL = 'https://lrmedia.nba.com/CF/_definst_/mp4:0001030565_1509kbps.mp4/chunklist_w79586375.m3u8';
//const testURL = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_30MB.mp4';
//const testURL = 'https://speed.hetzner.de/100MB.bin';
//const testURL = 'https://nba-referee-mobile.s3.amazonaws.com/WebPlays/18POTW_010.mp4?response-content-disposition=attachment%3Bfilename%3D%22NBAVideo.mp4%22&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20210217T105751Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604799&X-Amz-Credential=AKIAIVIRMUYAA64NDK2A%2F20210217%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=3995ffccefe21798d33076a0ecaa6aa165439da4c89da32d6f360011d562a881';
const urlRegex = /^(?:https?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

function isValid(url) {
  return urlRegex.test(url);
}

var m3u8Parser = require('m3u8-parser');


export default class App extends Component {
  constructor(props) {
    super(props);
    this.idsToData = {};
  }

  state = {
    url: '',
    status: 'idle',
    percent: 0,
    downloads: [],
    downloadsData: {},
  };

  async componentDidMount() {
    const tasks = await RNBGD.checkForExistingDownloads();
    if (tasks && tasks.length) {
      await this.loadDownloads();
      const downloadsData = {};
      const downloads = [];
      for (let task of tasks) {
        downloads.push(task.id);
        downloadsData[task.id] = {
          url: this.idsToData[task.id].url,
          percent: task.percent,
          // total: task.totalBytes,
          status: task.state === 'DOWNLOADING' ? 'downloading' : 'paused',
          task: task
        };
        this.attachToTask(task, this.idsToData[task.id].filePath);
      }
      this.setState({
        downloadsData,
        downloads
      });
    }
  }

  saveDownloads() {
    AsyncStorage.setItem('idsToData', JSON.stringify(this.idsToData));

  }

  async loadDownloads() {
    const mapStr = await AsyncStorage.getItem('idsToData');
    try {
      this.idsToData = JSON.parse(mapStr) || {};
    } catch (e) {
      console.error(e);
    }
  }

  pauseOrResume(id) {
    let newStatus;
    const download = this.state.downloadsData[id];
    if (download.status === 'downloading') {
      download.task.pause();
      newStatus = 'paused';
    } else if (download.status === 'paused') {
      download.task.resume();
      newStatus = 'downloading';
    } else {
      console.error(`Unknown status for play or pause: ${download.status}`);
      return;
    }

    this.setState(produce(draft => {
      draft.downloadsData[id].status = newStatus;
    }));
  }

  cancel(id) {
    const download = this.state.downloadsData[id];
    download.task.stop();
    delete this.idsToData[id];
    this.saveDownloads();
    this.setState(produce(draft => {
      delete draft.downloadsData[id];
      draft.downloads.splice(draft.downloads.indexOf(id), 1);
    }));
  }

  renderRow({ item: downloadId }) {
    const download = this.state.downloadsData[downloadId];
    let iconName = 'ios-pause';
    if (download.status === 'paused') {
      iconName = 'ios-play';
    }

    return (
      <View key={downloadId} style={styles.downloadItem}>
        <View style={{ flex: 1 }}>
          <View>
            <Text>{downloadId}</Text>
            <Text>{download.url}</Text>
          </View>
          <Slider
            value={download.percent}

          />
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={() => this.pauseOrResume(downloadId)}>
            <Icon name={iconName} size={26} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => this.cancel(downloadId)}>
            <Icon name="ios-close" size={40} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  attachToTask(task, filePath) {

    console.log('task', task)
    task.begin(expectedBytes => {
      this.setState(produce(draft => {
        // draft.downloadsData[task.id].total = expectedBytes;
        draft.downloadsData[task.id].status = 'downloading';
      }));
    })
      .progress(percent => {
        this.setState(produce(draft => {
          draft.downloadsData[task.id].percent = percent;
        }));
      })
      .done(async () => {
        try {
          console.log(`Finished downloading: ${task.id}, deleting it...`);
          console.log('filepath', filePath)
          //await RNFS.unlink(filePath);
          console.log(`Deleted ${task.id}`);
        } catch (e) {
          console.error(e);
        }
        delete this.idsToData[task.id];
        this.saveDownloads();
        this.setState(produce(draft => {
          delete draft.downloadsData[task.id];
          draft.downloads.splice(draft.downloads.indexOf(task.id), 1);
        }));
      })
      .error(err => {
        console.error(`Download ${task.id} has an error: ${err}`);
        delete this.idsToData[task.id];
        this.saveDownloads();
        this.setState(produce(draft => {
          delete draft.downloadsData[task.id];
          draft.downloads.splice(draft.downloads.indexOf(task.id), 1);
        }));
      });
  }

  addDownload() {
    // const id = Math.random()
    //   .toString(36)
    //   .substr(2, 6);

    var manifest = [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      '#EXT-X-TARGETDURATION:11',
      '#EXT-X-MEDIA-SEQUENCE:0',
      '#EXTINF:10.477,',
      'media_w79586375_0.ts',
      '#EXTINF:9.743,',
      'media_w79586375_1.ts',
      '#EXTINF:10.01,',
      'media_w79586375_2.ts',
      '#EXT-X-ENDLIST'
    ].join('\n');

    var parser = new m3u8Parser.Parser();

    parser.push(manifest);
    parser.end();

    var parsedManifest = parser.manifest;
    console.log('parseManifest', parsedManifest.segments)

    //const testURL = 'https://lrmedia.nba.com/CF/_definst_/mp4:0001030565_1509kbps.mp4/chunklist_w79586375.m3u8';

    var urlStart = testURL.substr(0, testURL.indexOf('.mp4'));
    console.log('custUrl', urlStart)



    const id = testURL.split('/').pop();
    console.log('testUrl', id)

    const filePath = `${RNBGD.directories.documents}/${id}`;

  
    for (let i = 0; i < parsedManifest.segments.length; i++) {
      let filePath1 = `${RNBGD.directories.documents}/${parsedManifest.segments[i].uri}`;
     
      // let filePath1 = `${RNFS.DocumentDirectoryPath}/${parsedManifest.segments[i].uri}`;
      console.log('-----filePath--1',filePath1)
      let taskTs = RNBGD.download({
        id: parsedManifest.segments[i].uri,
        url: urlStart.concat(".mp4/" + parsedManifest.segments[i].uri),
        destination: filePath1
      })
      this.attachToTask(taskTs, filePath1);
      console.log('taskTs',taskTs)
      console.log('urlStart',urlStart.concat(".mp4/" + parsedManifest.segments[i].uri))
    }

    const url = this.state.url || testURL;
    const task = RNBGD.download({
      id: id,
      url: url,
      destination: filePath,
    });
    this.attachToTask(task, filePath);
    this.idsToData[id] = {
      url,
      filePath
    };
    this.saveDownloads();

    this.setState(produce(draft => {
      draft.downloadsData[id] = {
        url: url,
        status: 'idle',
        task: task
      };
      draft.downloads.push(id);
      draft.url = '';
    }));




  }

  _keyExtractor = (item, index) => index.toString();

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.textInput}
          textContentType="none"
          autoCorrect={false}
          multiline={true}
          keyboardType="url"
          placeholder={testURL}
          onChangeText={(text) => {
            this.setState({ url: text.toLowerCase() });
          }}
          value={this.state.url}
        />
        <Button
          title="Add Download"
          onPress={this.addDownload.bind(this)}
          disabled={this.state.url !== '' && !isValid(this.state.url)}
        />
        <FlatList
          style={styles.downloadingList}
          data={this.state.downloads}
          renderItem={this.renderRow.bind(this)}
          extraData={this.state.downloadsData}
          keyExtractor={this._keyExtractor}
        />
      </SafeAreaView>
    );
  }
}