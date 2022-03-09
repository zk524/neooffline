import { Component, OnInit, Input } from '@angular/core';
import { Asset } from '@/models/models';
import {
    GlobalService,
    AssetState,
    ChromeService,
    NeonService,
} from '@/app/core';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-assets',
    templateUrl: 'assets.component.html',
    styleUrls: ['assets.component.scss'],
})
export class PopupAssetsComponent implements OnInit {
    @Input() public rateCurrency: string;
    myAssets: Asset[];
    private network;
    isLoading = false;

    constructor(
        private asset: AssetState,
        private chrome: ChromeService,
        private neon: NeonService,
        private global: GlobalService
    ) {}

    ngOnInit(): void {
        this.network =
            this.neon.currentWalletChainType === 'Neo2'
                ? this.global.n2Network.network
                : this.global.n3Network.network;
        this.getAssets();
    }

    getAssets() {
        this.isLoading = true;
        const getMoneyBalance = this.asset.getAddressBalances(
            this.neon.address
        );
        const getWatch = this.chrome.getWatch(
            this.neon.address,
            this.neon.currentWalletChainType,
            this.network
        );
        forkJoin([getMoneyBalance, getWatch]).subscribe((res) => {
            const [moneyAssets, watch] = [...res];
            let showAssets = [...moneyAssets];
            watch.forEach((item) => {
                const index = showAssets.findIndex(
                    (m) => m.asset_id === item.asset_id
                );
                if (index >= 0) {
                    if (item.watching === false) {
                        showAssets.splice(index, 1);
                    }
                } else {
                    if (item.watching === true) {
                        showAssets.push(item);
                    }
                }
            });
            this.myAssets = showAssets;
            this.isLoading = false;
        });
    }
}
