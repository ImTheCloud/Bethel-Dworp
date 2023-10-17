import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    ImageBackground,
    Alert
} from 'react-native';
import { Button, Input } from 'react-native-elements';
import { firestore } from '../Firebase';
import {AntDesign, Entypo, Feather, FontAwesome} from '@expo/vector-icons';
import { Linking } from 'react-native';

const openYoutubeLink = (youtubeLink) => {
    Linking.canOpenURL(youtubeLink)
        .then((supported) => {
            if (supported) {
                Linking.openURL(youtubeLink).catch((err) =>
                    console.error('Eroare la deschiderea link-ului YouTube:', err)
                );
            } else {
                // Le lien YouTube n'est pas pris en charge
                Alert.alert('Eroare', 'Acest link YouTube nu există.');
            }
        })
        .catch((err) =>
            console.error('Eroare la verificarea dacă URL-ul este suportat:', err)
        );
};

const Home = ({ navigation }) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [songs, setSongs] = useState([]);
    const [titleValue, setTitleValue] = useState('');
    const [lyricsValue, setLyricsValue] = useState('');
    const [youtubeLinkValue, setYoutubeLinkValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalVisible, setEditModalVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = firestore.collection('song').onSnapshot((snapshot) => {
            const songsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setSongs(songsData);
        });

        return () => unsubscribe();
    }, []);

    const toggleEditModal = () => {
        setEditModalVisible(!isEditModalVisible);
        // Pré-remplir les valeurs lors de l'activation du mode d'édition
        if (isEditModalVisible && selectedSong) {
            setTitleValue(selectedSong.title);
            setLyricsValue(selectedSong.lyrics);
        }
    };


    const toggleModal = (song) => {
        setSelectedSong(song);
        setEditModalVisible(false);
        setModalVisible(!isModalVisible);
        if (song) {
            setTitleValue(song.title);
            setLyricsValue(song.lyrics);

        } else {
            // Réinitialiser les valeurs si aucune chanson n'est sélectionnée
            setTitleValue('');
            setLyricsValue('');
            setYoutubeLinkValue('');

        }
    };


    const handleSaveEdit = async () => {
        try {
            await firestore.collection('song').doc(selectedSong.id).update({
                title: titleValue,
                lyrics: lyricsValue,
                youtubeLink: youtubeLinkValue,
            });
            setSelectedSong({
                ...selectedSong,
                title: titleValue,
                lyrics: lyricsValue,
                youtubeLink: youtubeLinkValue,
            });

            toggleEditModal();
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la chanson dans Firestore:', error);
        }
    };

    const handleTitleChange = (text) => {
        setTitleValue(text);
    };

    const handleLyricsChange = (text) => {
        setLyricsValue(text);
    };

    const handleYoutubeLinkChange = (text) => {
        setYoutubeLinkValue(text);
    };

    const handleSearchChange = (text) => {
        setSearchTerm(text);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const handleSubmit = async () => {
        if (!titleValue || !lyricsValue ||  !youtubeLinkValue) {
            Alert.alert('Eroare', 'Vă rugăm să completați toate câmpurile înainte de a adăuga o nouă cântare.');
            return;
        }

        try {
            await firestore.collection('song').add({
                title: titleValue,
                lyrics: lyricsValue,
                youtubeLink: youtubeLinkValue,
            });

            // Réinitialiser les valeurs des champs
            setTitleValue('');
            setLyricsValue('');
            setYoutubeLinkValue('');

            toggleModal(null);
        } catch (error) {
            console.error('Eroare la adăugarea melodiei în Firestore:', error);
        }
    };




    const handleDelete = () => {
        Alert.alert(
            'Confirmare',
            `Doriți să ștergeți cântarea "${selectedSong.title}" ?`,
            [
                {
                    text: 'Anulează',
                    style: 'cancel',
                },
                {
                    text: 'Șterge',
                    onPress: async () => {
                        try {
                            await firestore.collection('song').doc(selectedSong.id).delete();
                            toggleModal(null);
                        } catch (error) {
                            console.error('Eroare la ștergerea cântecului din Firestore:', error);
                        }
                    },
                },
            ],
            { cancelable: false, language: 'ro' }  // Ajoutez la propriété language pour spécifier la langue
        );
    };


    return (

        <View style={styles.container}>
            <View style={styles.searchInputContainer}>
                <Feather name="search" size={20} color="#000" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Căutați o cântare după titlu"
                    onChangeText={handleSearchChange}
                    value={searchTerm}
                />
                {searchTerm.length > 0 && (
                    <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                        <Feather name="x" size={20} color="#000" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.scrollView}>
                {songs
                    .filter((song) => song && song.title && song.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((song, index) => (
                        <TouchableOpacity
                            key={song.id}
                            onPress={() => toggleModal(song)}
                            style={styles.songButton}
                        >
                            <Text style={styles.songButtonText}>{`${index + 1}. ${song.title}`}</Text>
                        </TouchableOpacity>
                    ))}

            </ScrollView>


            <Button
                title="Adaugă o cântare"
                onPress={() => toggleModal(null)}
                containerStyle={styles.addButtonContainer}
                buttonStyle={styles.addButton}
                titleStyle={styles.buttonTitle}  // Ajout de cette ligne
            />

            <Modal
                visible={isModalVisible}
                onRequestClose={() => toggleModal(null)}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    {selectedSong ? (
                        <>
                            <TouchableOpacity onPress={toggleEditModal} style={styles.infoButton}>
                                <FontAwesome name="pencil" size={22} color="black" style={styles.editIcon} />
                            </TouchableOpacity>

                            {isEditModalVisible ? (
                                <>
                                    <ScrollView style={styles.scrollView}>
                                    <TextInput
                                        onChangeText={handleTitleChange}
                                        value={titleValue}
                                        style={styles.modalTitle}
                                    />

                                        <TextInput
                                        onChangeText={handleLyricsChange}
                                        value={lyricsValue}
                                        multiline={true}
                                        numberOfLines={25}
                                        style={styles.lyricsText}
                                    />

                                        <TextInput
                                            onChangeText={handleYoutubeLinkChange}
                                            value={youtubeLinkValue}
                                            placeholder="YouTube Link"
                                            style={styles.modalTitle}
                                        />

                                    </ScrollView>
                                    <Button
                                        title="Salvează"
                                        onPress={handleSaveEdit}
                                        containerStyle={styles.buttonContainer}
                                        buttonStyle={styles.addButton}
                                        titleStyle={styles.buttonTitle}
                                    />
                                    <Button
                                        title="Șterge"
                                        onPress={handleDelete}
                                        containerStyle={styles.buttonContainer}
                                        buttonStyle={styles.deleteButton}
                                        titleStyle={styles.buttonTitle}
                                    />

                                </>
                            ) : (
                                <ScrollView style={styles.scrollView}>
                                    <Text style={styles.modalTitle}>{selectedSong.title}</Text>
                                    <Text style={styles.lyricsText}>{selectedSong.lyrics}</Text>

                                    {selectedSong.youtubeLink && (
                                        <TouchableOpacity onPress={() => openYoutubeLink(selectedSong.youtubeLink)}>
                                            <Text style={styles.youtubeLink}>{selectedSong.youtubeLink}</Text>
                                        </TouchableOpacity>
                                    )}

                                </ScrollView>
                            )}
                        </>
                    ) : (
                        <>
                            <Text style={styles.modalTitle}>Adăugă o cântare !</Text>

                            <TextInput
                                onChangeText={handleTitleChange}
                                value={titleValue}
                                placeholder="Titlu"
                                style={styles.titleInput}
                            />
                            <TextInput
                                onChangeText={(text) => setYoutubeLinkValue(text)}
                                value={youtubeLinkValue}
                                placeholder="YouTube Link"
                                style={styles.titleInput}
                            />
                            <ScrollView >
                                <TextInput
                                    onChangeText={handleLyricsChange}
                                    placeholder="  Versuri"
                                    value={lyricsValue}
                                    multiline={true}
                                    numberOfLines={25}
                                    style={styles.lyricsInput}
                                />
                            </ScrollView>


                            <Button
                                title="Adăugă"
                                onPress={handleSubmit}
                                containerStyle={styles.buttonContainer}
                                buttonStyle={styles.addButton}
                                titleStyle={styles.buttonTitle}
                            />
                        </>
                    )}


                    <TouchableOpacity
                        onPress={() => toggleModal(null)}
                        style={styles.backButton}
                    >
                        <AntDesign name="arrowleft" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>

    );
};

const styles = StyleSheet.create({
    youtubeLink: {
        marginTop: 1000,
        color: 'rgba(20,50,175,0.83)',  // Couleur du bouton de suppression
        fontSize: 12,


    },

    deleteButton: {
        marginTop: 10,
        backgroundColor: 'rgba(180,2,2,0.77)',  // Couleur du bouton de suppression
        borderRadius: 10,
        borderWidth:1,
        borderColor: '#000',

    },
    infoButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 10,
    },

    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'rgba(246,244,238,255)', // Définissez la couleur de fond

    },
    searchInputContainer: {
        marginTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderColor: '#f6d8a6',
        borderWidth: 1,
        paddingHorizontal: 10,
        marginBottom: 10,
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        color: '#2c3e50',
    },
    buttonTitle: {
        color: '#000000',  // Définissez la couleur du texte à noir
    },

    scrollView: {
        flex: 1,
        width: '90%',
    },
    songButton: {
        borderWidth: 1,
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#f5ebd8',
        borderRadius: 5,
    },
    songButtonText: {
        color: '#000000',
    },
    addButtonContainer: {

        marginTop: 10,
        width: '90%',
        marginBottom: 0,
        alignItems: 'center',  // Centre le bouton horizontalement
    },
    addButton: {
        borderColor:'#000',
        borderWidth: 1,
        backgroundColor: '#f6d8a6',
        borderRadius: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(246,244,238,255)',
        padding: 20,
    },
    modalTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 30,
        marginBottom: 30,
        marginTop: 20,
        color: '#2c3e50',
    },

    lyricsText: {
        color: '#000',
        fontSize: 16,
        fontWeight:'bold'

    },
    titleInput: {
        width:280,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },

    lyricsInput: {
        width:280,
        borderWidth: 1,
        borderRadius: 5,
        
    },
    buttonContainer: {
        marginVertical: 10,
        width: '80%',
    },
    closeButton: {
        backgroundColor: 'rgba(231,76,60,0.72)',
    },
    clearButton: {
        marginLeft: 10,
    },


});

export default Home;
