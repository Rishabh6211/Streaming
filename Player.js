import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    Dimensions,
    Platform,
    StatusBar,
    Image
} from "react-native";
import ReactHlsPlayer from 'react-hls-player';

import JWPlayer from "react-native-jw-media-player";
var RNFS = require('react-native-fs');
import RNBGD from './indexx';
import {New} from './video/'
import Video from 'react-native-video'
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    subContainer: {
        flex: 1,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 40,
        backgroundColor: "black",
        alignItems: "center"
    },
    text: {
        fontSize: 18,
        color: "white",
        margin: 40
    },
    playerContainer: {
        height: 300,
        width: width - 40,
        backgroundColor: "white"
    },
    warningText: {
        color: "red",
        fontWeight: "700",
        position: "absolute",
        alignSelf: "center",
        top: 20
    },
    player: {
        flex: 1
    }
});

export default class Player extends Component {
    // constructor(){

    // }
    state = {
        path: '',
    }
    componentDidMount() {
        console.log('path12345')
        var path = RNBGD.directories.documents
        console.log('path123', path)

        RNFS.readDir(path) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
            .then((result) => {
                console.log('GOT RESULT', result[0].path);
                this.setState({ path: result[0].path })

                // stat the first file
                // return Promise.all([RNFS.stat(result[0].path), result[0].path]);
            })
            // .then((statResult) => {
            //     if (statResult[0].isFile()) {
            //         // if we have a file, read it
            //         return RNFS.readFile(statResult[1], 'utf8');
            //     }

            //     return 'no file';
            // })
            // .then((contents) => {
            //     // log the file contents
            //     console.log("contents",contents);
            // })
            .catch((err) => {
                console.log(err.message, err.code,"error---");
            });
    }

    onBeforePlay(data) {
        // eslint-disable-line
        console.log('onBeforePlay was called',data);
    }

    onPlay() {
        // eslint-disable-line
        // console.log('onPlay was called');
    }

    onPlayerError(error) {
        // eslint-disable-line
        console.log("onPlayerError was called with error: ", error);
    }

    onSetupPlayerError(error) {
        // eslint-disable-line
        console.log("onSetupPlayerError was called with error: ", error);
    }

    onBuffer(e) {
        // eslint-disable-line
        console.log('onBuffer was called', e);
    }

    onTime({ position, duration }) {
        // eslint-disable-line
        // console.log('onTime was called with: ', position, duration);
    }

    onFullScreen() {
        StatusBar.setHidden(true);
    }

    onFullScreenExit() {
        StatusBar.setHidden(false);
    }

    render() {
        console.log('state path', this.state.path)
        var path = RNBGD.directories.documents
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.subContainer}>
                    <Text style={styles.text}>
                        Welcome to react-native-jw-media-player
          </Text>
                    <View style={styles.playerContainer}>
                        {/* <Image source={require('./video/media_w79586375_1.ts')}/> */}
                        {/* <Text
                            style={styles.warningText}
                        >{`If you see this text your configuration or setup is wrong.\n\nDid you forget to add your JW key to your ${
                            Platform.OS === "ios" ? "plist" : "manifest"
                            }?\nDid you add a playlistItem with at least a file paramter?`}</Text> */}
                      
{/* HLS Player */}





                          
                          {/* {this.state.path !='' && */}
                           {/* <JWPlayer
                                style={styles.player}
                                playlistItem={{
                                    title: 'Track',                                 
                                    mediaId: '1',
                                   

                                    // file: "https://content.jwplatform.com/manifests/vM7nH0Kl.m3u8",
                                //   source:require('./video/new.mov'),
                                    // file: "file:///storage/emulated/0/Android/data/com.vodeoapp/files/chunklist_w79586375.m3u8",
                                    file: `file://${this.state.path}/chunklist_w79586375.m3u8`,
                                    autostart: false,
                                    
                                }}
                                
                                onBeforePlay={(data) => this.onBeforePlay(data)}
                                onPlay={() => this.onPlay()}
                                onSetupPlayerError={(e) => this.onSetupPlayerError(e)}
                                onPlayerError={(e) => this.onPlayerError(e)}
                                onBuffer={(e) => this.onBuffer(e)}
                                onTime={(time) => this.onTime(time)}
                                nativeFullScreen={true} // when undefined or false you will need to handle the player styles in onFullScreen & onFullScreenExit callbacks
                                onFullScreen={() => this.onFullScreen()}
                                onFullScreenExit={() => this.onFullScreenExit()}
                            /> */}


                        

        {/* <Video
        //   source={{uri:`https://content.jwplatform.com/manifests/vM7nH0Kl.m3u8`}}
        source={{uri:'file:///Users/rishabh/Desktop/POC/poc/video/media_w79586375_1.ts'}}
        // source={{uri:'/Users/rishabh/Desktop/Screen Recording 2021-02-19 at 2.36.16 PM.mov'}}
        // source={{uri:require('./video/chunklist_w79586375.m3u8')}}
          style={{ width: 350, height: 300 }}
          muted={true}
          repeat={true}
          resizeMode={"cover"}
          volume={1.0}
          rate={1.0}
          ignoreSilentSwitch={"obey"}
          

        /> */}
                    </View>
                </View>
            </SafeAreaView>
        );
    }
}