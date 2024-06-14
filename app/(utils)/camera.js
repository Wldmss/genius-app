import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as ImagePicker from 'expo-image-picker';
import { FontText } from 'utils/TextUtils';
import { dispatchOne } from 'utils/DispatchUtils';
import { checkIn } from 'api/LoginApi';

const cancel_img = require('assets/images/close.png');
const no_img = require('assets/images/close.png');
import BackIcon from 'assets/icons/icon-back.svg';
import CameraIcon from 'assets/icons/icon-camera.svg';
import { commonInputStyles } from 'assets/styles';

/** QR 스캐너 */
const Camera = () => {
    const [urlText, setUrlText] = useState('');
    const [scan, setScan] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [type, setType] = useState('scan');
    const [status, requestPermission] = useCameraPermissions();

    // 웹 뷰로 돌아가기
    const backToWeb = () => {
        store.dispatch(dispatchOne('SET_CAMERA', false));
    };

    // QR 코드 스캔
    const scanCode = (...args) => {
        if (urlText == '') {
            const data = args[0].data;
            let result = typeof data != 'string' ? JSON.stringify(data) : data;
            if (result != '') {
                setUrlText(result.replace(/^"(.*)"$/, '$1'));
                setScan(true);
            }
        }
    };

    // scan 모달 닫기
    const resetScan = () => {
        setScan(false);
        setUrlText('');
        setSelectedImage(null);
    };

    // 링크 이동
    const goToLink = async (e) => {
        const urlParam = urlText == null || urlText == '' || !(urlText.startsWith('{') && urlText.endsWith('}')) ? {} : JSON.parse(urlText);
        const urlKey = Object.keys(urlParam);

        if (urlKey.length > 0 && urlKey.includes('educId') && urlKey.includes('role')) {
            await checkIn(urlParam).then(({ status, message }) => {
                const msgText = message == null || message == '' ? '다시 시도해주세요.' : message;
                Alert.alert(process.env.EXPO_PUBLIC_NAME, msgText, [
                    {
                        text: '확인',
                        onPress: () => {
                            resetScan();

                            if (status) {
                                backToWeb();
                            }
                        },
                    },
                ]);
            });
        } else {
            Alert.alert(process.env.EXPO_PUBLIC_NAME, '올바르지 않은 링크입니다.', [
                {
                    text: '확인',
                    onPress: () => {
                        resetScan();
                    },
                },
            ]);
        }

        if (e) e.stopPropagation();
    };

    const pickImage = async () => {
        setType('library');
        // No permissions request is necessary for launching the image library

        // pick an image from gallery
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result || result.canceled || !result.assets || !result.assets.length) return;

        const photo = result.assets[0];
        if (photo.uri) {
            try {
                setSelectedImage(photo.uri);

                const scannedResults = await BarCodeScanner.scanFromURLAsync(photo.uri);

                const dataNeeded = scannedResults[0].data;
                setUrlText(dataNeeded);
                setScan(true);
            } catch (error) {
                setUrlText('');
                setScan(false);
                Alert.alert('QR 코드를 찾을 수 없습니다.');
            }
        }
    };

    useEffect(() => {
        if (!status?.granted) requestPermission();
    }, []);

    useEffect(() => {
        resetScan();
    }, [type]);

    useEffect(() => {
        // 코드 스캔 시 바로 이동
        if (scan) goToLink();
    }, [scan]);

    return (
        <View style={styles.container}>
            {/* header */}
            <View style={styles.header}>
                <Pressable style={styles.headerItem} onPress={backToWeb}>
                    <BackIcon />
                    <FontText style={styles.headerText}>뒤로가기</FontText>
                </Pressable>
            </View>
            {/* camera */}
            <View style={styles.imageContainer}>
                {type == 'scan' ? (
                    status?.granted ? (
                        <CameraView
                            style={styles.camera}
                            facing="back"
                            onBarcodeScanned={scanCode}
                            barcodeScannerSettings={{
                                barcodeTypes: ['qr'],
                            }}
                            zoom={0.0}
                        />
                    ) : (
                        <Pressable onPress={requestPermission} style={styles.permissionBox}>
                            <FontText style={styles.permissionTxt}>카메라 권한을 허용해주세요</FontText>
                            <View style={[commonInputStyles.button, styles.permissionBtn]}>
                                <CameraIcon />
                                <FontText style={styles.permissionBtnTxt}>권한 허용</FontText>
                            </View>
                        </Pressable>
                    )
                ) : (
                    <Image
                        style={selectedImage != null ? styles.image : styles.noImage}
                        source={selectedImage != null ? { uri: selectedImage } : no_img}
                        resizeMode="contain"
                    />
                )}
            </View>
            {/* url box */}
            <Modal visible={false /**scan*/} transparent={true}>
                <Pressable style={styles.modal} onPress={(event) => resetScan(event)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalUrlContainer}>
                            <FontText style={styles.modalUrlText}>{urlText}</FontText>
                            <Pressable onPress={resetScan} style={styles.modalCancelContainer}>
                                <Image source={cancel_img} style={styles.modalCancel}></Image>
                            </Pressable>
                        </View>
                        <View style={styles.modalBtnContainer}>
                            <Pressable style={styles.modalBtn} onPress={(e) => goToLink(e)}>
                                <FontText style={styles.modalBtnText}>이동</FontText>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 60,
        paddingHorizontal: 15,
        justifyContent: `center`,
        backgroundColor: `#ffffff`,
    },
    headerItem: {
        gap: 10,
        flexDirection: `row`,
    },
    headerText: {
        fontSize: 18,
        textAlignVertical: `center`,
    },
    scanImg: {
        height: 25,
    },
    tabImg: {
        width: 50,
        height: 50,
    },
    imageContainer: {
        alignItems: `center`,
        justifyContent: `center`,
    },
    camera: {
        width: `100%`,
        height: `100%`,
    },
    image: {
        width: `100%`,
        height: `100%`,
    },
    permissionBox: {
        alignItems: `center`,
        gap: 30,
        top: 80,
    },

    permissionTxt: {
        fontSize: 19,
        lineHeight: 23,
    },
    permissionBtn: {
        flexDirection: `row`,
        gap: 10,
        padding: 30,
        height: 70,
        width: 210,
    },
    permissionBtnTxt: {
        fontSize: 16,
        textAlignVertical: `center`,
    },
    noImage: {},
    modal: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // 배경에 투명도를 줍니다.
    },
    modalContent: {
        width: `95%`,
        gap: 5,
        backgroundColor: `white`,
        position: `relative`,
        shadowColor: '#ddd',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        borderRadius: 5,
        marginBottom: 20,
        padding: 15,
    },

    modalUrlContainer: {
        justifyContent: `space-between`,
        flexDirection: `row`,
        gap: 5,
        overflow: `hidden`,
    },
    modalUrlText: {
        flex: 1,
    },
    modalCancelContainer: {
        alignSelf: 'flex-start',
    },
    modalCancel: {
        width: 15,
        height: 15,
    },
    modalBtnContainer: {
        marginLeft: `auto`,
    },
    modalBtn: {
        alignSelf: `flex-start`,
    },
    modalBtnText: {
        color: `#006adc`,
        textAlign: `right`,
        paddingLeft: 20,
    },
    boldText: {
        fontWeight: `bold`,
        color: `#006adc`,
    },
});

export default Camera;
