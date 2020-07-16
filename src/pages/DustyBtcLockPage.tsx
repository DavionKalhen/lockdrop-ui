import React, { useState } from 'react';
import {
    IonContent,
    IonPage,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonIcon,
    IonLabel,
} from '@ionic/react';
import { warning } from 'ionicons/icons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionCard from '../components/SectionCard';
import { Typography, Link, makeStyles, createStyles } from '@material-ui/core';
import quantstampLogo from '../resources/quantstamp-logo.png';
import trezorLogo from '../resources/trezor_logo.svg';
import ledgerLogo from '../resources/ledger_logo.svg';
//import * as btcLock from '../helpers/lockdrop/BitcoinLockdrop';
import { BtcWalletType, BtcNetwork } from '../types/LockdropModels';
import BtcRawSignature from '../components/BtcLock/BtcRawSignature';
import TrezorLock from '../components/BtcLock/TrezorLock';
import TrezorConnect, { DEVICE } from 'trezor-connect';

const useStyles = makeStyles(theme =>
    createStyles({
        quantLogo: {
            marginRight: theme.spacing(2),
            maxHeight: 20,
            height: '100%',
            verticalAlign: 'middle',
        },
        textBox: {
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    }),
);

export default function DustyBtcLockPage() {
    const classes = useStyles();

    const [walletType, setWalletType] = useState<BtcWalletType>(BtcWalletType.None);
    const [startedTrezor, setTrezorInst] = useState(false);

    const handleTrezor = () => {
        // only initialize if there isn't a instance
        if (startedTrezor) {
            setWalletType(BtcWalletType.Trezor);
        } else {
            TrezorConnect.on('DEVICE_EVENT', event => {
                if (event.type === DEVICE.CONNECT) {
                    console.log('connected to Trezor device');
                } else if (event.type === DEVICE.DISCONNECT) {
                    console.log('disconnected to Trezor device');
                }
            });

            TrezorConnect.init({
                manifest: {
                    email: 'developers@stake.co.jp',
                    appUrl: 'https://lockdrop.plasmnet.io',
                },
                debug: true,
                lazyLoad: true,
                popup: true,
            })
                .then(() => {
                    console.log('connected to Trezor');
                    setWalletType(BtcWalletType.Trezor);
                    setTrezorInst(true);
                })
                .catch(e => {
                    console.log('something went wrong\n' + e);
                });
        }
    };

    const handleLedger = () => {
        console.log('logging in to Ledger');
        setWalletType(BtcWalletType.Ledger);
    };

    const handleRawTx = () => {
        console.log('logging in to raw transaction');
        setWalletType(BtcWalletType.Raw);
    };

    const ChangeSignView: React.FC = () => {
        switch (walletType) {
            default:
            case BtcWalletType.None:
                return <></>;
            case BtcWalletType.Raw:
                return <BtcRawSignature networkType={BtcNetwork.TestNet} />;
            case BtcWalletType.Trezor:
                return <TrezorLock networkType={BtcNetwork.TestNet} />;
        }
    };

    return (
        <>
            <IonPage>
                <Navbar />
                <IonContent>
                    <SectionCard maxWidth="md">
                        <div>
                            <Typography variant="h4" component="h1" align="center">
                                Dusty Plasm Network BTC Lockdrop
                            </Typography>
                            <Typography variant="body2" component="h2" align="center">
                                Audited by{' '}
                                <Link
                                    color="inherit"
                                    href="https://github.com/staketechnologies/lockdrop-ui/blob/16a2d495d85f2d311957b9cf366204fbfabadeaa/audit/quantstamp-audit.pdf"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <img src={quantstampLogo} alt="" className={classes.quantLogo} />
                                    {/*todo: This is a placeholder auditor, please change this to the actual one after the audit*/}
                                </Link>
                            </Typography>
                        </div>
                        <ChangeSignView />

                        <IonCard>
                            <IonCardHeader>
                                <IonCardSubtitle>Choose your message signing method</IonCardSubtitle>
                                <IonCardTitle>Sign in</IonCardTitle>
                            </IonCardHeader>

                            <IonCardContent>
                                <IonItem button onClick={() => handleTrezor()}>
                                    <IonIcon icon={trezorLogo} slot="start" />
                                    <IonLabel>Sign in with Trezor</IonLabel>
                                </IonItem>

                                <IonItem button onClick={() => handleLedger()} disabled>
                                    <IonIcon icon={ledgerLogo} slot="start" />
                                    <IonLabel>Sign in with Ledger</IonLabel>
                                </IonItem>

                                <IonItem button onClick={() => handleRawTx()}>
                                    <IonIcon icon={warning} slot="start" />
                                    <IonLabel>Direct sign</IonLabel>
                                </IonItem>
                            </IonCardContent>
                        </IonCard>
                    </SectionCard>
                    <Footer />
                </IonContent>
            </IonPage>
        </>
    );
}