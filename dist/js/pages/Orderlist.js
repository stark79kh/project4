"use strict";
$(document).ready(function(){
    /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
    const gCOLUMN_ORDER_ID = 0;
    const gCOLUMN_SIZE_COMBO = 1;
    const gCOLUMN_TYPE_PIZZA = 2;
    const gCOLUMN_DRINK = 3;
    const gCOLUMN_PRICE = 4 ;
    const gCOLUMN_FULL_NAME = 5;
    const gCOLUMN_PHONE_NUMBER = 6;
    const gCOLUMN_STATUS = 7;
    const gCOLUMN_ACTION = 8;

    const gORDER_COL = ["orderId", "kichCo", "loaiPizza", "idLoaiNuocUong", "thanhTien", "hoTen", "soDienThoai", "trangThai", "action"];
    var gOrderDb = {
        orders: [],
        // các phương thức để làm việc với dữ liệu order
        filterOrder: function(paramFilterObj){
            var vOrderFilterResult = [];
            vOrderFilterResult = this.orders.filter(function(paramOrder){
                if(paramOrder.trangThai !== null && paramOrder.loaiPizza !== null){
                    return (
                        (paramFilterObj.trangThai === "none"  || paramOrder.trangThai.toLowerCase().includes(paramFilterObj.trangThai.toLowerCase())) &&
                        (paramFilterObj.loaiPizza === "none"  || paramOrder.loaiPizza.toLowerCase().includes(paramFilterObj.loaiPizza.toLowerCase()))
                    );
                }    
            });
            return vOrderFilterResult;
        }
    }
    //mảng dữ liệu trạng thái
    var gSelectDb = {
        status: [
            {
                value: "open",
                trangThai: "open"
            },
            {
                value: "confirm",
                trangThai: "confirm"
            },
            {
                value: "cancel",
                trangThai: "cancel"
            }
        ],
        typePizza: [
            {
                value: "hawaii",
                loaiPizza: "hawaii"
            },
            {
                value: "bacon",
                loaiPizza: "bacon"
            },
            {
                value: "seafood",
                loaiPizza: "seafood"
            },
        ]
    }
    
    var gSelectStatus = gSelectDb.status;
    var gSelectTypePizza = gSelectDb.typePizza;
    // định nghĩa table  - chưa có data
    var gOrdersTable = $("#order-table").DataTable( {
    // Khai báo các cột của datatable
    columns : [
        { data : gORDER_COL[gCOLUMN_ORDER_ID] },
        { data : gORDER_COL[gCOLUMN_SIZE_COMBO] },
        { data : gORDER_COL[gCOLUMN_TYPE_PIZZA] },
        { data : gORDER_COL[gCOLUMN_DRINK] },
        { data : gORDER_COL[gCOLUMN_PRICE] },
        { data : gORDER_COL[gCOLUMN_FULL_NAME] },
        { data : gORDER_COL[gCOLUMN_PHONE_NUMBER] },
        { data : gORDER_COL[gCOLUMN_STATUS] },
        { data : gORDER_COL[gCOLUMN_ACTION] }
    ],
    searching: false,
    paging: false,
    info: true,
    // Ghi đè nội dung của cột action, chuyển thành button chi tiết
    columnDefs: [ 
        {
            targets: gCOLUMN_ACTION,
            defaultContent:`<a class='info-edit btn btn-info' href="#" title="edit"><i class="fas fa-edit"></i></a>
                            <a class='info-delete btn btn-danger' href="#" title="delete"><i class="fas fa-trash-alt"></i></a>`
        }]
    });

    //biến toàn cục Order id
    var gOrderID = "";
    //biến toàn cục id
    var gID = "";
    //biến toàn cục chứa dữ liệu load lên modal
    var gOrderOnModal = [];
    //biến toàn cục select Drink
    var gSelectDrink = {};
    // biến toàn cục dùng để lưu trữ combo được chọn, mỗi khi khách chọn bạn lại đổi giá trị properties của nó
    var gSelectedMenuStructure = {
        menuName: "...",    // S, M, L
        duongKinhCM: "",
        suongNuong: "",
        saladGr: "",
        drink: "",
        priceVND: "",
        totalPrice: "",
        loaiNuocNgot: "Tất cả loại nước uống"
    };
    // biến toàn cục để lưu loại pizza đươc chọn, mỗi khi khách chọn, bạn lại đổi giá trị cho nó
    var gSelectedPizzaType = "..."
    // biến toàn cục Object input của customer khi nhập vào dữ liệu
    var gInputCustomerObject = {};
    //biến toàn cục phần trăm giảm giá
    var gDiscount = "";

    /*** REGION 2 - Vùng gán / thực thi hàm xử lý sự kiện cho các elements */
    onPageLoading();
    //gán sự kiện click cho icon edit
    $("#order-table").on("click", ".info-edit", function(){
        onBtnEditClick(this);
    });
    //gán sự kiện click cho nút confirm modal
    $("#btn-update-modal").on("click", function() {
        onBtnUpdateModalClick();
    });
    //gán sự kiện click nút filter
    $("#btn-filter-order").on("click", function() {
    onBtnFilterOrderClick();
    });
    //gán sự kiện click cho icon edit
    $("#order-table").on("click", ".info-delete", function(){
        onBtnDeleteClick(this);
    });
    //gán sự kiện click đồng ý xóa từ modal
    $("#btn-agree-delete").on("click", function(){
        onBtnAgreeDeleteClick();
    });
    //gán sự kiện click close modal sau khi xóa thành công
    $("#reload").on("click", function(){
        location.reload();
    });
    //gán sự kiện click nút thêm order
    $("#btn-new-order").on("click", function(){
        onBtnCreateOrder();
    });
    //gán sự kiện click cho nút size S
    $("#btn-size-s").on("click", function(){
        onButtonSizeSClick();
    });
    //gán sự kiện click cho nút size m
    $("#btn-size-m").on("click", function(){
        onButtonSizeMClick();
    });
    //gán sự kiện click cho nút size m
    $("#btn-size-l").on("click", function(){
        onButtonSizeLClick();
    });
    //gán sự kiện click cho nút loại pizza ocean mania
    $("#bnt-pizza-type-1").on("click", function(){
        onButtonPizzaOceanClick();
    });
    //gán sự kiện click cho nút loại pizza hawaiian
    $("#bnt-pizza-type-2").on("click", function(){
        onButtonPizzaHawaiianClick();
    });
    //gán sự kiện click cho nút loại pizza bacon
    $("#bnt-pizza-type-3").on("click", function(){
        onButtonPizzaBaconClick();
    });
    //gán sự kiện nút tạo đơn trên modal
    $("#btn-create-order").on("click", function(){
        onBtnNewOrder();
    });
    //gán sự kiện nút xác nhận đơn mới trên modal
    $("#btn-agree-new-order").on("click", function(){
        onBtnVerifyNewOrder();
    });
    //gán sự kiện nút close modal input tạo đơn
    $("#btn-clean-order").on("click", function(){
        //reload lại trang hủy tạo đơn
        location.reload();
    });
    //gán sự kiện nút quay lại trên thông tin xác nhận modal tạo đơn mới
    $("#btn-new-order-goback").on("click", function(){
        //ẩn modal xác nhận
        $("#info-order-modal").modal("hide");
        //hiện lại modal input đơn mới
        $("#new-order-modal").modal("show");
    })
    //gán sự kiện nút close sau khi có xác nhận đơn hàng thành công
    $("#btn-close-verify").on("click", function(){
        //reload lại trang
        location.reload();
    })
    //gán sự kiện nút quay lại trên modal edit
    $("#btn-goback").on("click", function(){
        //reload lại trang
        location.reload();
    })
    //gán sự kiện nút không xóa trên modal xóa
    $("#btn-no-delete").on("click", function(){
        //reload lại trang
        location.reload();
    })

    /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
    //hàm được chạy khi load trang
    function onPageLoading() {
        // lấy data từ server
        $.ajax({
            url: "http://42.115.221.44:8080/devcamp-pizza365/orders",
            type: "GET",
            dataType: 'json',
            success: function(responseObject){
            gOrderDb.orders = responseObject;
            console.log( gOrderDb.orders);
            //load data lên bảng
            loadDataToTable(gOrderDb.orders);
            },
            error: function(error){
            console.assert(error.responseText);
            }
        });
        //load select trạng thái lên bảng
        loadDataSelectStatusToTbale();
        //load select loại pizza lên bảng
        loadDataSelectTypePizzaToTbale();
    }

    // hàm xử xử lý sự kiện edit btn click
    function onBtnEditClick(paramEditClick){
        console.log("test btn edit");
    
        //Xác định thẻ tr là cha của nút được chọn
        var vRowSelected = $(paramEditClick).parents('tr');
        //Lấy datatable row
        var vDatatableRow = gOrdersTable.row(vRowSelected);      
        //Lấy data của dòng 
        var vOrderData = vDatatableRow.data();
        gOrderID = vOrderData.orderId; //orderId tại dòng đc click
        gID = vOrderData.id;// id tại dòng được click

        //dùng orderid để load dữ liệu từ api
        $.ajax({
            url: "http://42.115.221.44:8080/devcamp-pizza365/orders" + "/" + gOrderID,
            type: "GET",
            dataType: 'json',
            success: function(responseObject){
                gOrderOnModal = responseObject;
                console.log(gOrderOnModal);
                //load data lên bảng
                loadDataToModal(gOrderOnModal);
            },
            error: function(){
                alert("error!")
            }
        });
        //hiển thị modal
        $("#order-modal").modal("show");

    }

    //hàm xử lý sự kiện delete btn click
    function onBtnDeleteClick(paramDeleteClick){
        console.log("test btn Delete");
        $("#delete-modal").modal("show");
        //Xác định thẻ tr là cha của nút được chọn
        var vRowSelected = $(paramDeleteClick).parents('tr');
        //Lấy datatable row
        var vDatatableRow = gOrdersTable.row(vRowSelected);      
        //Lấy data của dòng 
        var vOrderData = vDatatableRow.data();
        gOrderID = vOrderData.orderId; //orderId tại dòng đc click
        gID = vOrderData.id;// id tại dòng được click
        $("#order-id").val(gOrderID);
    }

    //hàm xác nhận xóa đơn trên modal
    function onBtnAgreeDeleteClick(){
        console.log("test btn Agree Delete");
        console.log(gID);

        $.ajax({
            url: "http://42.115.221.44:8080/devcamp-pizza365/orders" + "/" + gID,
            type: "DELETE",
            dataType: 'json',
            success: function(responseObject){
            $("#delete-ok-modal").modal("show");
            $("#delete-modal").modal("hide");    
            },
            error: function(error){
            console.assert(error.responseText);
            }
        });

    }

    // hàm xử lý sự kiện nút filter
    function onBtnFilterOrderClick(){
        console.log("test");
        
        // Khai báo đối tượng chứa dữ liệu lọc trên form
        var vOrderFilterDataObj = {
            trangThai: "",
            loaiPizza: ""
        };
        // B1: Thu thập dữ liệu
        getFilterData(vOrderFilterDataObj);
        console.log(vOrderFilterDataObj);
        console.log(vOrderFilterDataObj.trangThai);
        // B2: Validate
        // B3: Thực hiện nghiệp vụ lọc
        var vOrderFilterResult = gOrderDb.filterOrder(vOrderFilterDataObj);
        // B4: Hiển thị dữ liệu lên table
        loadDataToTable(vOrderFilterResult);
    
    }

    // hàm xử lý sự kiện nút Update trên modal click
    function onBtnUpdateModalClick(){
        console.log("test nút update");
        //thu thập dữ liệu
        var vStatus = $("#status-modal").val();
        //xử lý dữ liệu
        if(vStatus == "confirmed"){
            onConfirmOrder();//chuyển trạng thái sang comfirmed
        }
        if(vStatus == "cancel"){
            onCancelStatus();//chuyển trạng thái sang cancel
        }
        if(vStatus == "open"){
            onOpenStatus();//chuyển trạng thái sang open
        }
    }

    //hàm xử lý sự kiện khi nút thêm order click
    function onBtnCreateOrder(){
        console.log("test nút thêm order");
        
        //load dữ liệu drink đổ vào select
        //send request lên API để load dữ liệu select
        $.ajax({
            url: "http://42.115.221.44:8080/devcamp-pizza365/drinks",
            type: "GET",
            dataType: 'json',
            success: function(responseObject){
            gSelectDrink = responseObject
            console.log(gSelectDrink);
            //load data lên select
            loadDataToSelectDrink(gSelectDrink);
            $("#new-order-modal").modal("show");
            },
            error: function(error){
            console.assert(error.responseText);
            }
        });
    }

    //hàm xử lý sự kiện click cho nút size S
    function  onButtonSizeSClick(){
        console.log("button Size S click");
        //Đổi màu nút
        $("#btn-size-s").removeClass("btn-warning").addClass("btn-success");
        $("#btn-size-m").removeClass("btn-success").addClass("btn-warning");
        $("#btn-size-l").removeClass("btn-success").addClass("btn-warning");
        var vPizzaSizeS = {
            menuName: "S",
            duongKinhCM: "20",
            suongNuong: "2",
            saladGr: "200",
            drink: "2",
            priceVND: "150000"
        }
        //gán dữ liệu vào gSelectedMenuComboSize khi user ấn nút
        gSelectedMenuStructure = vPizzaSizeS;
        console.log(gSelectedMenuStructure);        
    }
    
    //hàm xử lý sự kiện click cho nút size M
    function onButtonSizeMClick(){
        console.log("button Size M click");
        //Đổi màu nút
        $("#btn-size-m").removeClass("btn-warning").addClass("btn-success");
        $("#btn-size-s").removeClass("btn-success").addClass("btn-warning");
        $("#btn-size-l").removeClass("btn-success").addClass("btn-warning");
        //Dữ liệu trong combo pizza size M
        var vPizzaSizeM = {
            menuName: "M",
            duongKinhCM: "25",
            suongNuong: "4",
            saladGr: "300",
            drink: "3",
            priceVND: "200000"
        }
        //gán dữ liệu vào gSelectedMenuComboSize khi user ấn nút
        gSelectedMenuStructure = vPizzaSizeM;
        console.log(gSelectedMenuStructure);    
    }

    //hàm xử lý sự kiện click cho nút size L
    function onButtonSizeLClick(){
        console.log("button Size L click");
        //Đổi màu nút
        $("#btn-size-l").removeClass("btn-warning").addClass("btn-success");
        $("#btn-size-s").removeClass("btn-success").addClass("btn-warning");
        $("#btn-size-m").removeClass("btn-success").addClass("btn-warning");
        //Dữ liệu trong combo pizza size L
        var vPizzaSizeL = {
            menuName: "L",
            duongKinhCM: "30",
            suongNuong: "8",
            saladGr: "500",
            drink: "4",
            priceVND: "250000"
        }
        //gán dữ liệu vào gSelectedMenuComboSize khi user ấn nút
        gSelectedMenuStructure = vPizzaSizeL;
        console.log(gSelectedMenuStructure);
    }

    //hàm xử lý sự kiện click pizza OCEAN
    function onButtonPizzaOceanClick(){
        console.log("button loại pizza seafood click");
        //Đổi màu nút khi nhấn
        $("#bnt-pizza-type-1").removeClass("btn-warning").addClass("btn-success");
        $("#bnt-pizza-type-2").removeClass("btn-success").addClass("btn-warning");
        $("#bnt-pizza-type-3").removeClass("btn-success").addClass("btn-warning");
        //Dữ liệu trong pizza type 1
        var vPizzaStypeOne = "Seafood";
        //gán dữ liệu vào dữ liệu chung khi ấn nút
        gSelectedPizzaType = vPizzaStypeOne;
        console.log(gSelectedPizzaType);
    }

    //hàm xử lý sự kiện click pizza HAWAIIAN
    function onButtonPizzaHawaiianClick(){
        console.log("button loại pizza HAWAII click");
        //Đổi màu nút khi nhấn
        $("#bnt-pizza-type-2").removeClass("btn-warning").addClass("btn-success");
        $("#bnt-pizza-type-1").removeClass("btn-success").addClass("btn-warning");
        $("#bnt-pizza-type-3").removeClass("btn-success").addClass("btn-warning");
        //Dữ liệu trong pizza type 1
        var vPizzaStypeOne = "Hawaii";
        //gán dữ liệu vào dữ liệu chung khi ấn nút
        gSelectedPizzaType = vPizzaStypeOne;
        console.log(gSelectedPizzaType);
    }

    //hàm xử lý sự kiện click pizza BACON
    function onButtonPizzaBaconClick(){
        console.log("button loại pizza BACON click");
        //Đổi màu nút khi nhấn
        $("#bnt-pizza-type-3").removeClass("btn-warning").addClass("btn-success");
        $("#bnt-pizza-type-1").removeClass("btn-success").addClass("btn-warning");
        $("#bnt-pizza-type-2").removeClass("btn-success").addClass("btn-warning");
        //Dữ liệu trong pizza type 1
        var vPizzaStypeOne = "Bacon";
        //gán dữ liệu vào dữ liệu chung khi ấn nút
        gSelectedPizzaType = vPizzaStypeOne;
        console.log(gSelectedPizzaType);
    }

    //hàm xử lý sự kiện tạo đơn trên modal
    function onBtnNewOrder(){
        console.log("test nút tạo đơn");
        var vInputCustomerObject = gInputCustomerObject
        // B1: thu thap du lieu
        getInputFormData(vInputCustomerObject);
        // B2: kiem tra du lieu
        var vIsValidData = validateData(vInputCustomerObject);
        if( vIsValidData){
            //B3: check voucher
            checkVoucher(vInputCustomerObject);
            console.log(vInputCustomerObject);
            //B4: hiển thị modal
            //lưu thông tin lên modal
            showInfoDataToModal(vInputCustomerObject);
            //hiển thị thông tin lên modal
            $('#info-order-modal').modal('show');
            //ẩn modal nhập đơn mới
            $("#new-order-modal").modal("hide");
        }

    }

    //hàm xử lý sự kiện nút xác nhận đơn mới trên modal click
    function  onBtnVerifyNewOrder(){
        console.log("test nút verifly");
        // Khai báo đối tượng chứa dữ liệu trên form
        var vOrderObj = {
            kichCo: "",
            duongKinh: "",
            suon: "",
            salad: "",
            loaiPizza: "",
            idVourcher: "",
            idLoaiNuocUong: "",
            soLuongNuoc: "",
            hoTen: "",
            thanhTien: "",
            email: "",
            soDienThoai: "",
            diaChi: "",
            loiNhan: ""
        };
        //B1: thu thập dữ liệu
        getOrderObj(vOrderObj);
        console.log(vOrderObj);
        //B2: kiểm tra dữ liệu (không cần đã kiểm tra khi nhập input)
        //B3: sendrequest tạo mới đơn hàng trên API
        $.ajax({
            url: "http://42.115.221.44:8080/devcamp-pizza365/orders",
            type: "POST",
            contentType: "application/json;charset=UTF-8",
            data: JSON.stringify(vOrderObj),
            dataType: 'json', // added data type
            success: function (res) {
                //B4: xử lý front-end
                console.log(res);
                showModalVerify(res);
            },
            error: function () {
            alert("Gửi đơn chưa thành công//có thể hệ thống lỗi//liên hệ nhân viên để được trợ giúp")
            }
        });
    }
    
    /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình */
    // load data to table
    function loadDataToTable(paramResponseObject) {
        //Xóa toàn bộ dữ liệu đang có của bảng
        gOrdersTable.clear();
        //Cập nhật data cho bảng 
        gOrdersTable.rows.add(paramResponseObject);
        //Cập nhật lại giao diện hiển thị bảng
        gOrdersTable.draw();
    }
    
    //load select trạng thái
    function loadDataSelectStatusToTbale(){
        var vSelectStatus = $("#select-trang-thai");

        var vOptionStatus = $("<option/>", {
            value: "none",
            text: "---Chọn trạng thái---"
            }).appendTo(vSelectStatus);
            
            for (var bI = 0; bI < gSelectStatus.length; bI++) {
        var vOptionStatus = $("<option/>", {
            value: gSelectStatus[bI].value,
            text: gSelectStatus[bI].trangThai
            }).appendTo(vSelectStatus);
        }
    }

    //load select typrpizza
    function loadDataSelectTypePizzaToTbale(){
        var vSelectTypePizza = $("#select-type-pizza");

        var vOptionTypePizza = $("<option/>", {
            value: "none",
            text: "---Chọn Loại Pizza---"
            }).appendTo(vSelectTypePizza);
            
            for (var bI = 0; bI < gSelectTypePizza.length; bI++) {
        var vOptionTypePizza = $("<option/>", {
            value: gSelectTypePizza[bI].value,
            text: gSelectTypePizza[bI].loaiPizza
            }).appendTo(vSelectTypePizza);
        }

    }

    // hàm thu thập dữ liệu để filter
    function getFilterData(paramFilterObj){
        paramFilterObj.trangThai = $("#select-trang-thai").val();
        console.log(paramFilterObj.trangThai);
        paramFilterObj.loaiPizza = $("#select-type-pizza").val();
        console.log(paramFilterObj.loaiPizza);
    }

    //hàm load dữ liệu lên Modal edit trạng thái
    function loadDataToModal(paramOrderObject){
        $("#fullname-modal").val(paramOrderObject.hoTen);
        $("#phonenumber-modal").val(paramOrderObject.soDienThoai);
        $("#email-modal").val(paramOrderObject.email);
        $("#address-modal").val(paramOrderObject.diaChi);
        $("#voucher-modal").val(paramOrderObject.idVourcher);
        $("#msg-modal").val(paramOrderObject.loiNhan);
        $("#info-order").val("Menu: " + paramOrderObject.kichCo +
                             ", Sườn nướng: " + paramOrderObject.suon +
                             ", Salad: " + paramOrderObject.salad +
                             ", Loại nước: " + paramOrderObject.idLoaiNuocUong +
                             ", Số lượng nước: " + paramOrderObject.soLuongNuoc +
                             ", Loại Pizza: " + paramOrderObject.loaiPizza);
        $("#price-modal").val(paramOrderObject.thanhTien);
        $("#discount-modal").val(paramOrderObject.giamGia);
        $("#payment-modal").val(paramOrderObject.thanhTien - paramOrderObject.giamGia);
        $("#status-modal").val(paramOrderObject.trangThai);
        $("#date1-modal").val(paramOrderObject.ngayTao);
        $("#date2-modal").val(paramOrderObject.ngayCapNhat);
    }

    //hàm load dữ liệu data vào select
    function loadDataToSelectDrink(paramObject){
        var vSelectDrink = $("#select-drink");
        for (var bI = 0; bI < paramObject.length; bI++) {
            var vOptionDrink = $("<option/>", {
                value: paramObject[bI].maNuocUong,
                text: paramObject[bI].tenNuocUong
            }).appendTo(vSelectDrink);
        }
    }

    //hàm thu thập dữ liệu input trên modal tạo mới đơn
    function getInputFormData(paramInputCustomer){
        paramInputCustomer.fullName = $("#inp-fullname").val().trim();
        paramInputCustomer.email = $("#inp-email").val().trim();
        paramInputCustomer.phoneNumber = $("#inp-dien-thoai").val().trim();
        paramInputCustomer.address = $("#inp-dia-chi").val().trim();
        paramInputCustomer.note = $("#inp-message").val().trim();
        paramInputCustomer.voucher = $("#voucher-ID").val().trim();
        paramInputCustomer.loaiNuocNgot = $("#select-drink").val();
    }

    //hàm kiểm tra dữ liệu input trên modal tạo đơn
    function validateData(paramInputCustomer){
        "use strict";
        if (gSelectedMenuStructure.menuName === "...") {
            alert("Vui lòng chọn Combo Menu");
            return false;
        }
        if (gSelectedPizzaType === "..."){
            alert("Vui lòng chọn Loại Pizza");
            return false;
        }
        if (paramInputCustomer.loaiNuocNgot === "none") {
            alert("Vui lòng chọn Loại đồ uống");
            return false;
        }
        if (paramInputCustomer.fullName === "") {
            alert("Vui lòng nhập họ và tên");
            return false;
        }
        var vFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if(paramInputCustomer.email!=="" && !vFilter.test(paramInputCustomer.email)){
            alert("Vui lòng nhập Email hợp lệ //Vd: abc@gmail.com");
            return false;
        }
        var vRegex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
        if (paramInputCustomer.phoneNumber === ""|| !vRegex.test(paramInputCustomer.phoneNumber)) {
            alert("Vui lòng nhập đúng số điện thoại //Vd: 0912345678");
            return false;
        }
        if (paramInputCustomer.address === "") {
            alert("Vui lòng nhập địa chỉ");
            return false;
        }
        if(paramInputCustomer.voucher !== "" &&  isNaN(paramInputCustomer.voucher)){
            alert("Voucher phải là dãy số");
            return false;
        }
        return true;
    }

    //hàm kiểm tra mã giảm giá
    function checkVoucher(paramVoucherCheck){
        var vVoucherCheck = paramVoucherCheck.voucher;
        if(vVoucherCheck == ""){
            vVoucherCheck = 0
        }
        //send request lên API để check voucher
        $.ajax({
            url:  "http://42.115.221.44:8080/devcamp-voucher-api/voucher_detail/" + vVoucherCheck,
            type: 'GET',
            dataType: 'json',
            success: function(res) {
                console.log(res);
                gDiscount = res.phanTramGiamGia;
                console.log(gDiscount);
                //số tiền được giảm
                var vPaymentDiscount = paymentDiscount(gSelectedMenuStructure.priceVND, gDiscount);
                // lưu thông tin số tiền được giảm vào modal
                $("#discount-new-order-modal").val(vPaymentDiscount + " (Giảm " + gDiscount + "%)");
                //số tiền phải thanh toán
                var vpayment = gSelectedMenuStructure.priceVND - vPaymentDiscount;
                // lưu thông tin số tiền phải thanh toán vào modal
                $("#payment-new-order-modal").val(vpayment);
            },
            error: function () {
                $("#voucher-new-order-modal").val("chưa nhập mã/ mã không đúng");
                $("#discount-new-order-modal").val("0");
                $("#payment-new-order-modal").val(gSelectedMenuStructure.priceVND);
            }
        })
    }

    //hàm tính giá được giảm
    function paymentDiscount(paramA, paramB){
        return (paramA*paramB/100);
    }

    //hàm xử lý lưu thông tin vào modal xác nhận đơn mới
    function showInfoDataToModal(paramOrderObject){
        $("#fullname-new-order-modal").val(paramOrderObject.fullName);
        $("#phonenumber-new-order-modal").val(paramOrderObject.phoneNumber);
        $("#email-new-order-modal").val(paramOrderObject.email);
        $("#address-new-order-modal").val(paramOrderObject.address);
        $("#voucher-new-order-modal").val(paramOrderObject.voucher);
        $("#msg-new-order-modal").val(paramOrderObject.note);
        $("#info-new-order").val("Menu: " + gSelectedMenuStructure.menuName +
                             ", Sườn nướng: " + gSelectedMenuStructure.suongNuong +
                             ", Salad: " + gSelectedMenuStructure.saladGr +
                             ", Loại nước: " + paramOrderObject.loaiNuocNgot +
                             ", Số lượng nước: " + gSelectedMenuStructure.drink +
                             ", Loại Pizza: " + gSelectedPizzaType);
        $("#price-new-order-modal").val(gSelectedMenuStructure.priceVND);    
    }

    //tổng hợp lại dữ liệu để sendrequest tạo mới order lên API
    function getOrderObj(paramOrderObjToSendAPI){
        paramOrderObjToSendAPI.kichCo = gSelectedMenuStructure.menuName;
        paramOrderObjToSendAPI.duongKinh = gSelectedMenuStructure.duongKinhCM;
        paramOrderObjToSendAPI.suon = gSelectedMenuStructure.suongNuong;
        paramOrderObjToSendAPI.salad = gSelectedMenuStructure.saladGr;
        paramOrderObjToSendAPI.loaiPizza = gSelectedPizzaType;
        paramOrderObjToSendAPI.idVourcher = gInputCustomerObject.voucher;
        paramOrderObjToSendAPI.idLoaiNuocUong = gInputCustomerObject.loaiNuocNgot;
        paramOrderObjToSendAPI.soLuongNuoc = gSelectedMenuStructure.drink;
        paramOrderObjToSendAPI.hoTen = gInputCustomerObject.fullName;
        paramOrderObjToSendAPI.thanhTien = gSelectedMenuStructure.priceVND;
        paramOrderObjToSendAPI.email = gInputCustomerObject.email;
        paramOrderObjToSendAPI.soDienThoai = gInputCustomerObject.phoneNumber;
        paramOrderObjToSendAPI.diaChi = gInputCustomerObject.address;
        paramOrderObjToSendAPI.loiNhan = gInputCustomerObject.note;
    }

    //hàm show modal verify
    function showModalVerify(paramVerfy){
        //ẩn modal order thông tin xác nhận
        $("#info-order-modal").modal("hide");
        var vOrderId = paramVerfy.orderId
        $("#new-order-id").val(vOrderId);
        $("#verify-modal").modal("show");    
    }

    // hàm xử lý sự kiện update open khi update trên modal click
    function onOpenStatus(){
        var vObjectRequest = {
            trangThai: "open" //3: trang thai open, confirmed, cancel tùy tình huống
        }
        $.ajax({
            url: "http://42.115.221.44:8080/devcamp-pizza365/orders" + "/" + gID,
            type: 'PUT',
            contentType:"application/json;charset=UTF-8",
            data:JSON.stringify(vObjectRequest),
            dataType: 'json', // added data type
            success: function (res) {
            console.log(res);
            //tải lại trang
            location.reload();
            },
            error: function (ajaxContext) {
            alert(ajaxContext.responseText)
            }
        });
    }
    //hàm xử lý sự kiện udate confirm khi update click
    function onConfirmOrder(){
        console.log("test confirm");
        console.log("Id khi ấn nút confirm: " + gID);
        var vObjectRequest = {
            trangThai: "confirmed" //3: trang thai open, confirmed, cancel tùy tình huống
        }
        $.ajax({
            url: "http://42.115.221.44:8080/devcamp-pizza365/orders" + "/" + gID,
            type: 'PUT',
            contentType:"application/json;charset=UTF-8",
            data:JSON.stringify(vObjectRequest),
            dataType: 'json', // added data type
            success: function (res) {
            console.log(res);
            //tải lại trang
            location.reload();
            },
            error: function (ajaxContext) {
            alert(ajaxContext.responseText)
            }
        });
    }

    // hàm xử lý sự kiện cancel khi nút update trên modal click
    function onCancelStatus(){
        console.log("test Cancel");
        console.log("Id khi ấn nút cancel: " + gID);
        var vObjectRequest = {
            trangThai: "cancel" //3: trang thai open, confirmed, cancel tùy tình huống
        }
        $.ajax({
            url: "http://42.115.221.44:8080/devcamp-pizza365/orders" + "/" + gID,
            type: 'PUT',
            contentType:"application/json;charset=UTF-8",
            data:JSON.stringify(vObjectRequest),
            dataType: 'json', // added data type
            success: function (res) {
            console.log(res);
            //tải lại trang
            location.reload();
            },
            error: function (ajaxContext) {
            alert(ajaxContext.responseText)
            }
        });
    }

})