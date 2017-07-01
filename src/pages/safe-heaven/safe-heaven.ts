import { SafeHeavenCreatePage } from './../safe-heaven/safe-heaven.create/safe-heaven.create';
import { NavController } from 'ionic-angular';
import { GlobalService } from './../../common/global.service';
import { SafeHeavenService, SafeHeaven } from './../../common/safeheaven.service';
import { Component, OnInit } from '@angular/core';
@Component({
    selector: 'safe-heaven',
    templateUrl: './safe-heaven.html'
})
export class SafeHeavenPage implements OnInit {
    private safeHeavens: Array<SafeHeaven> = [];
    constructor(
        private sh: SafeHeavenService,
        private gs: GlobalService,
        private nav: NavController
    ) { }

    ngOnInit() {
        this.getInfo();
        this.gs.updateView.subscribe(() => this.getInfo())
    }

    getInfo() {
        this.sh.getList().subscribe(safeHeavens => {
            this.safeHeavens = safeHeavens;
        }, err => {
            this.gs.simpleAlert('Error');
        })
    }

    add() {
        this.nav.push(SafeHeavenCreatePage);
    }

}